#!/usr/bin/env node
// Builds the hero promo soundtrack (public/promo/vo.mp3) on the same schedule the promo
// animates to, so sound and picture stay locked together.
//
//   pnpm promo:audio --lead lead.wav --won won.wav --pitch pitch.mp3 --closer closer.mp3 \
//     --music-dash pulse.mp3 --music-pitch beat.mp3 --music-pitch-from 5 --music-pitch-to 27 \
//     --music-pitch-loop 5.17:2.6374 --riser riser.mp3 --riser-peak 7.0
//
// Voice: each notification line is placed at its toast's time. As the gaps shrink, the line
// is sped up (up to 2.2x) and then allowed to overlap the next one, which is what turns the
// end of the burst into mush. The pitch starts at SCRIPT_START.
// Effects: a synthesised ping per toast, and a riser whose peak (--riser-peak, seconds into
// the file) lands on the flip; its tail fades fast so the beat of silence stays clean.
// Music (optional): one bed under the dashboard that cuts at the flip, one under the pitch
// and closer. If the pitch bed's cut is shorter than the pitch, whole bars are looped from
// --music-pitch-loop <downbeat>:<bar seconds> so the join lands on the beat. Both beds duck
// under the voice with a sidechain compressor. Needs ffmpeg.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { END_CARD, CLOSER_START, FLIP_START, LEAD_TIMES, LOOP, SCRIPT_START, WIN_TIMES } from "../lib/promo.ts";

const { values: args } = parseArgs({
  options: {
    lead: { type: "string" },
    won: { type: "string" },
    pitch: { type: "string" },
    closer: { type: "string" },
    "music-dash": { type: "string" },
    "music-pitch": { type: "string" },
    "music-pitch-from": { type: "string", default: "0" },
    "music-pitch-to": { type: "string" },
    "music-pitch-loop": { type: "string" },
    riser: { type: "string" },
    "riser-peak": { type: "string", default: "0" },
    out: { type: "string", default: "public/promo/vo.mp3" },
  },
});
if (!args.lead || !args.won || !args.pitch) {
  console.error("Usage: --lead <file> --won <file> --pitch <file> [--music-dash <file>] [--music-pitch <file> --music-pitch-from <s> --music-pitch-to <s>]");
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "promo-vo-"));
const ff = (...a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a]);
const duration = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const ms = (s) => Math.round(s * 1000);

// ---- voice
// Trim the silence TTS leaves at either end, so each line starts exactly on its toast.
const trimBoth = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse";
const prep = (src, name, filter) => {
  const out = join(tmp, name);
  ff("-i", src, "-af", filter, "-ac", "1", "-ar", "44100", out);
  return out;
};
const lead = prep(args.lead, "lead.wav", trimBoth);
const won = prep(args.won, "won.wav", trimBoth);
// The pitch is not trimmed: the script cue times in lib/promo.ts are word starts in the raw file.
const pitch = prep(args.pitch, "pitch.wav", "anull");
// Closing line ("Best part? ..."), also untrimmed so its cue times match the raw file.
const closer = args.closer ? prep(args.closer, "closer.wav", "anull") : null;

// ---- synthesised sound effects
const synth = (name, expr, secs, post = "anull") => {
  const out = join(tmp, name);
  ff("-f", "lavfi", "-i", `aevalsrc='${expr}':s=44100:d=${secs}`, "-af", post, "-ac", "1", out);
  return out;
};
const note = (hz, at, decay, gain) => `${gain}*sin(2*PI*${hz}*(t-${at}))*exp(-(t-${at})*${decay})*gte(t,${at})`;
// Lead: soft two-note chime, E6 then A6. Won: brighter three-note rise, C6 E6 G6.
const pingLead = synth("ping-lead.wav", [note(1318.5, 0, 14, 0.5), note(1760, 0.09, 12, 0.45), note(2637, 0, 22, 0.1)].join("+"), 0.6);
const pingWon = synth("ping-won.wav", [note(1046.5, 0, 10, 0.4), note(1318.5, 0.07, 10, 0.4), note(1568, 0.14, 8, 0.45), note(3136, 0.14, 18, 0.08)].join("+"), 0.9);

// ---- graph
const inputs = [lead, won, pitch, pingLead, pingWon];
const chains = [];
const notes = [];
const fx = [];

// Notification lines, in time order; each is sped up to fit the gap to the next event.
const events = [...LEAD_TIMES.map((at) => ({ input: 0, at })), ...WIN_TIMES.map((at) => ({ input: 1, at }))].sort((a, b) => a.at - b.at);
const lens = [duration(lead), duration(won)];
// atempo only takes 0.5..2 per stage, so chain stages for anything faster.
const atempo = (x) => {
  const parts = [];
  while (x > 2) {
    parts.push("atempo=2");
    x /= 2;
  }
  parts.push(`atempo=${x.toFixed(3)}`);
  return parts.join(",");
};
const split = (input, n, prefix) => {
  const outs = Array.from({ length: n }, (_, k) => `${prefix}${k}`);
  chains.push(`[${input}:a]asplit=${n}${outs.map((o) => `[${o}]`).join("")}`);
  return outs;
};
const leadCopies = split(0, LEAD_TIMES.length, "l");
const wonCopies = split(1, WIN_TIMES.length, "w");
events.forEach((e, n) => {
  const src = e.input === 0 ? leadCopies.shift() : wonCopies.shift();
  const gap = Math.max(0.05, (events[n + 1]?.at ?? e.at + 0.15) - e.at);
  const tempo = Math.min(2.2, Math.max(1, lens[e.input] / (gap * 0.92)));
  chains.push(`[${src}]${atempo(tempo)},adelay=${ms(e.at)}|${ms(e.at)}[n${n}]`);
  notes.push(`[n${n}]`);
});

// Effects: [input, times, volume]. Pings sit under the voice.
const sfx = [
  [3, LEAD_TIMES, 0.32],
  [4, WIN_TIMES, 0.32],
];
for (const [input, times, vol] of sfx) {
  const outs = Array.from({ length: times.length }, (_, k) => `s${input}_${k}`);
  chains.push(`[${input}:a]volume=${vol},asplit=${times.length}${outs.map((o) => `[${o}]`).join("")}`);
  times.forEach((at, k) => {
    chains.push(`[${outs[k]}]adelay=${ms(at)}|${ms(at)}[${outs[k]}d]`);
    fx.push(`[${outs[k]}d]`);
  });
}

if (args.riser) {
  const n = inputs.push(args.riser) - 1;
  const peak = Number(args["riser-peak"]);
  const start = FLIP_START - peak; // seconds into the loop where the riser begins
  const skip = Math.max(0, -start); // if it would start before 0, drop its head instead
  chains.push(`[${n}:a]aformat=channel_layouts=mono,atrim=${skip}:${(peak + 0.9).toFixed(2)},asetpts=PTS-STARTPTS,afade=t=out:st=${(peak - skip + 0.05).toFixed(2)}:d=0.7,volume=-10dB,adelay=${ms(Math.max(0, start))}|${ms(Math.max(0, start))}[riser]`);
  fx.push("[riser]");
}

const mix = (labels, out, post = "") => chains.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:dropout_transition=0${post}[${out}]`);
// The notification mush cuts hard at the flip, leaving a beat of silence before the pitch.
mix(notes, "notes", `,afade=t=out:st=${(FLIP_START + 0.1).toFixed(2)}:d=0.12`);
chains.push(`[2:a]adelay=${ms(SCRIPT_START)}|${ms(SCRIPT_START)}[vp]`);
const voiceParts = ["[notes]", "[vp]"];
if (closer) {
  const n = inputs.push(closer) - 1;
  chains.push(`[${n}:a]adelay=${ms(CLOSER_START)}|${ms(CLOSER_START)}[vc]`);
  voiceParts.push("[vc]");
}
mix(voiceParts, "voice");
mix(fx, "fx");

// Music beds: levelled well under the voice, then ducked further whenever someone speaks.
const music = [];
if (args["music-dash"]) {
  const n = inputs.push(args["music-dash"]) - 1;
  const len = FLIP_START + 0.05;
  // Fades in, swells a little as the notifications speed up, and cuts dead at the flip.
  chains.push(`[${n}:a]aformat=channel_layouts=mono,atrim=0:${len.toFixed(2)},asetpts=PTS-STARTPTS,volume='0.75+0.25*t/${len.toFixed(2)}':eval=frame,afade=t=in:d=0.4,afade=t=out:st=${(len - 0.08).toFixed(2)}:d=0.08,volume=-12dB[md]`);
  music.push("[md]");
}
if (args["music-pitch"]) {
  const n = inputs.push(args["music-pitch"]) - 1;
  const from = Number(args["music-pitch-from"]);
  const to = args["music-pitch-to"] ? Number(args["music-pitch-to"]) : Infinity;
  // Run under the pitch and closer, then keep playing for 3s over the end card, fading out.
  const FADE = 3;
  const need = END_CARD - 0.4 + FADE - SCRIPT_START;
  const fmt = "aformat=channel_layouts=mono";
  if (args["music-pitch-loop"] && to - from < need) {
    const [down, bar] = args["music-pitch-loop"].split(":").map(Number);
    const cut = down + Math.floor((to - down) / bar) * bar; // last downbeat inside the cut
    const extraBars = Math.ceil((need - (cut - from)) / bar);
    chains.push(`[${n}:a]${fmt},asplit=2[mpA][mpB]`);
    chains.push(`[mpA]atrim=${from}:${cut.toFixed(4)},asetpts=PTS-STARTPTS[mp1]`);
    chains.push(`[mpB]atrim=${down}:${(down + extraBars * bar).toFixed(4)},asetpts=PTS-STARTPTS[mp2]`);
    chains.push(`[mp1][mp2]acrossfade=d=0.02:c1=tri:c2=tri[mpj]`);
  } else {
    chains.push(`[${n}:a]${fmt},atrim=${from}:${Math.min(to, from + need)},asetpts=PTS-STARTPTS[mpj]`);
  }
  chains.push(`[mpj]atrim=0:${need.toFixed(2)},afade=t=out:st=${(need - FADE).toFixed(2)}:d=${FADE},volume=-13dB,adelay=${ms(SCRIPT_START)}|${ms(SCRIPT_START)}[mp]`);
  music.push("[mp]");
}

if (music.length) {
  mix(music, "bed", `,apad=whole_len=${Math.round(LOOP * 44100)}`);
  // The compressor stops when its key does, so pad the voice key out to the full loop.
  chains.push(`[voice]asplit=2[voiceOut][voiceRaw];[voiceRaw]apad=whole_len=${Math.round(LOOP * 44100)}[voiceKey]`);
  chains.push("[bed][voiceKey]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=350:makeup=1[ducked]");
  chains.push(`[voiceOut][fx][ducked]amix=inputs=3:normalize=0:dropout_transition=0,alimiter=limit=0.9,apad=whole_len=${Math.round(LOOP * 44100)},atrim=0:${LOOP.toFixed(2)}[out]`);
} else {
  chains.push(`[voice][fx]amix=inputs=2:normalize=0:dropout_transition=0,alimiter=limit=0.9,apad=whole_len=${Math.round(LOOP * 44100)},atrim=0:${LOOP.toFixed(2)}[out]`);
}

mkdirSync(join(process.cwd(), "public/promo"), { recursive: true });
ff(...inputs.flatMap((f) => ["-i", f]), "-filter_complex", chains.join(";"), "-map", "[out]", "-ac", "1", "-ar", "44100", "-b:a", "112k", args.out);
console.log(`Wrote ${args.out} (${duration(args.out).toFixed(2)}s, loop ${LOOP.toFixed(2)}s, pitch at ${SCRIPT_START.toFixed(2)}s${music.length ? `, ${music.length} music bed(s)` : ""})`);
