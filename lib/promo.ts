/**
 * Timeline for the hero promo. The dashboard's notifications are the voice lines: toasts
 * alternate "Hi tradie, new lead" / "Hi tradie, job won", back and forth, speeding up
 * until the stack floods. Then a flip, and the pitch as kinetic text.
 * All times are seconds from the start of the loop. When the voiceover is generated,
 * scripts/build-promo-audio.mjs lays the audio out on this same schedule, and the
 * script cue times get replaced with word timings from the transcript.
 */

export type Cue = { at: number; text: string };

/** Events coming faster and faster: `first` is the first gap, each next gap is `factor` times the last. */
export type Burst = { start: number; first: number; factor: number; count: number };

function burstTimes(b: Burst): number[] {
  const out: number[] = [];
  let at = b.start;
  let gap = b.first;
  for (let k = 0; k < b.count; k++) {
    out.push(at);
    at += gap;
    gap *= b.factor;
  }
  return out;
}
const burstEnd = (b: Burst) => b.start + (b.first * (1 - Math.pow(b.factor, b.count))) / (1 - b.factor);

// One burst, alternating lead / won. The first gaps let each line play at natural speed.
export const BURST: Burst = { start: 0.8, first: 1.9, factor: 0.8, count: 16 };
const EVENT_TIMES = burstTimes(BURST);
/** Even events are "new lead", odd are "job won". */
export const LEAD_TIMES = EVENT_TIMES.filter((_, n) => n % 2 === 0);
export const WIN_TIMES = EVENT_TIMES.filter((_, n) => n % 2 === 1);
const FLOOD_END = burstEnd(BURST);

/** Revenue climbs across both bursts, accelerating with them. */
export const COUNT = { from: 38240, to: 100480, start: BURST.start, end: FLOOD_END };

/** The dashboard warps over the last stretch of the flood, then flips. */
export const WARP_FROM = FLOOD_END - 1.4;
export const FLIP_START = FLOOD_END + 0.2;
export const FLIP_DUR = 0.8;

/** Beat of silence after the flip, then the talking script. */
export const SCRIPT_START = FLIP_START + FLIP_DUR + 0.3;

/** Word starts from the transcript of the pitch take (Mike), in seconds from the start of the file. `*word*` renders in the accent colour. */
const SCRIPT: [number, string][] = [
  [0.16, "Anybody can build you a website."],
  [2.44, "Anyone can post an ad."],
  [4.4, "At *MXD*,"],
  [5.54, "we *performancemaxxx*"],
  [6.66, "until your calendar is full,"],
  [8.68, "every day"],
  [9.52, "of every week."],
  [10.96, "If we don't get you to"],
  [11.92, "*$100K*"],
  [13.1, "of new work in 3 months,"],
  [14.9, "we will fire ourselves."],
  [16.8, "We run ads that target"],
  [18.02, "your *exact* customer"],
  [19.48, "and build websites"],
  [20.5, "that convert them"],
  [21.3, "into *cold,*"],
  [22.2, "*hard*"],
  [22.66, "*cash.*"],
];

/** Closing line, its own take, starting a beat after "cash". Times are within that file. */
const CLOSER_AT = 23.8;
const CLOSER: [number, string][] = [
  [0.11, "Best part?"],
  [1.19, "You don't pay us *for ads*"],
  [2.98, "until you actually"],
  [3.92, "*win the job.*"],
];

export const CLOSER_START = SCRIPT_START + CLOSER_AT;
export const CUES: Cue[] = [
  ...SCRIPT.map(([at, text]) => ({ at: SCRIPT_START + at, text })),
  ...CLOSER.map(([at, text]) => ({ at: CLOSER_START + at, text })),
];
export const END_CARD = CLOSER_START + 4.8;
/** End card (line + CTA) holds a little over 4s before the loop restarts. */
export const LOOP = END_CARD + 4.2;

/** Voiceover, built by scripts/build-promo-audio.mjs. Plays only after the visitor taps "Sound on". */
export const PROMO_AUDIO: string | null = "/promo/vo.mp3";

/** Trade-specific jobs for the dashboard notifications and recent list. */
export const JOBS: Record<string, { job: string; suburb: string; value: string }[]> = {
  plumbers: [
    { job: "Bathroom renovation", suburb: "Paddington", value: "$18,500" },
    { job: "Drain relining", suburb: "Chermside", value: "$11,800" },
    { job: "Re-pipe and hot water", suburb: "Carindale", value: "$12,400" },
    { job: "New build rough-in", suburb: "Toowong", value: "$16,500" },
    { job: "Commercial fitout", suburb: "Coorparoo", value: "$24,000" },
  ],
  roofers: [
    { job: "Roof restoration", suburb: "Wynnum", value: "$14,400" },
    { job: "Re-roof", suburb: "Indooroopilly", value: "$24,000" },
    { job: "Metal roof replacement", suburb: "Ashgrove", value: "$31,000" },
    { job: "Gutters and fascia", suburb: "Sunnybank", value: "$10,800" },
    { job: "Commercial re-roof", suburb: "Bardon", value: "$46,000" },
  ],
  builders: [
    { job: "Home extension", suburb: "Bulimba", value: "$86,000" },
    { job: "Deck and pergola", suburb: "Mermaid Beach", value: "$24,500" },
    { job: "Granny flat", suburb: "Redcliffe", value: "$128,000" },
    { job: "Kitchen renovation", suburb: "Hamilton", value: "$42,000" },
    { job: "Garage conversion", suburb: "Logan", value: "$38,000" },
  ],
  landscapers: [
    { job: "Backyard makeover", suburb: "Kenmore", value: "$18,000" },
    { job: "Retaining walls", suburb: "Springfield", value: "$12,600" },
    { job: "Pool landscaping", suburb: "Robina", value: "$34,000" },
    { job: "Outdoor kitchen and paving", suburb: "Albany Creek", value: "$22,400" },
    { job: "Garden design and build", suburb: "Paddington", value: "$15,500" },
  ],
};
