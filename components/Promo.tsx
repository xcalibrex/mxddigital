"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { TRADES } from "@/lib/trades";
import {
  COUNT,
  CUES,
  END_CARD,
  FLIP_DUR,
  FLIP_START,
  JOBS,
  LEAD_TIMES,
  LOOP,
  PROMO_AUDIO,
  SCRIPT_START,
  WARP_FROM,
  WIN_TIMES,
} from "@/lib/promo";
import { useLanding } from "./LandingState";
import { LogoMark } from "./Logo";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

/** `*word*` → accent span. */
function accented(text: string): ReactNode[] {
  return text.split("*").map((part, n) => (n % 2 ? <span key={n} className="accent">{part}</span> : part));
}

/**
 * Hero promo: jobs dashboard where lead and job-won notifications (the voice lines) arrive
 * faster and faster while revenue climbs, a flip on its axis, then the pitch as kinetic text.
 * Browsers block autoplay with sound, so it waits on a play button and then runs once with
 * the voiceover, the audio's currentTime driving every frame. It ends on the CTA.
 */
type Phase = "idle" | "playing" | "ended";
/** Hold point after playback: the end card and CTA are up and the music has faded. */
const HOLD_AT = END_CARD + 3;

export function Promo() {
  const { state } = useLanding();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [clock, setClock] = useState(0);
  const [muted, setMuted] = useState(false);
  const t = phase === "idle" ? 0 : phase === "ended" ? HOLD_AT : clock;

  // Trade is pinned when playback starts so the dashboard doesn't change mid-sequence.
  const [tradeIdx, setTradeIdx] = useState(state.i);
  const trade = TRADES[phase === "idle" ? state.i : tradeIdx];
  const jobs = JOBS[trade.slug];

  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let fallback = 0;
    let prev = performance.now();
    const frame = (now: number) => {
      const audio = audioRef.current;
      // Audio drives the clock; if it couldn't start, a frame clock keeps the picture going.
      if (audio && !audio.paused) fallback = audio.currentTime;
      else fallback += Math.min(0.1, (now - prev) / 1000);
      prev = now;
      if (fallback >= HOLD_AT) {
        audio?.pause();
        setPhase("ended");
        return;
      }
      setClock(fallback);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const play = () => {
    setTradeIdx(state.i);
    setClock(0);
    if (PROMO_AUDIO) {
      audioRef.current ??= new Audio(PROMO_AUDIO);
      const a = audioRef.current;
      a.currentTime = 0;
      a.muted = muted;
      a.play().catch(() => {});
    }
    setPhase("playing");
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  // ---- dashboard: notifications are the voice lines, so they share the voiceover schedule
  const leads = LEAD_TIMES.filter((at) => t >= at).length;
  const wins = WIN_TIMES.filter((at) => t >= at).length;
  const events = [
    ...LEAD_TIMES.slice(0, leads).map((at, n) => ({ at, won: false, job: jobs[n % jobs.length] })),
    ...WIN_TIMES.slice(0, wins).map((at, n) => ({ at, won: true, job: jobs[(n + 2) % jobs.length] })),
  ].sort((x, y) => x.at - y.at);
  const toasts = events.slice(-4);
  const countP = clamp01((t - COUNT.start) / (COUNT.end - COUNT.start));
  const revenue = COUNT.from + (COUNT.to - COUNT.from) * countP * countP * countP;
  const counting = countP > 0 && countP < 1;
  // Flood: the dashboard shakes and warps harder until it flips.
  const flood = clamp01((t - WARP_FROM) / (FLIP_START - WARP_FROM));
  const shake = flood * flood * 0.6;
  const shakeX = Math.sin(t * 91) * shake;
  const shakeY = Math.cos(t * 67) * shake;

  // ---- flip: dashboard turns away, text stage turns in
  const half = FLIP_DUR / 2;
  const out = clamp01((t - FLIP_START) / half);
  const into = clamp01((t - FLIP_START - half) / half);
  const onDash = t < FLIP_START + half;
  const endCard = phase !== "idle" && t >= END_CARD;
  // The end card fades to black over the last stretch before the loop restarts.
  const endFade = 1 - clamp01((t - (LOOP - 1)) / 0.9);

  return (
    <div className="promo">
      <p className="sr-only">
        Demo: new leads arrive in the MXD jobs dashboard and booked revenue climbs past $100,000.
      </p>
      <svg className="promo-defs" aria-hidden="true" width="0" height="0">
        <filter id="promo-warp" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="1" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale={onDash ? flood * flood * 46 : 5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {onDash ? (
        <div
          className="pd"
          aria-hidden="true"
          style={{
            transform: `translate(${shakeX}%, ${shakeY}%) rotateY(${out * 90}deg) scale(${1 - out * 0.08})`,
            filter: flood > 0 ? "url(#promo-warp)" : undefined,
          }}
        >
          <aside className="pd-side">
            <LogoMark className="pd-logo" />
            {[0, 1, 2, 3, 4].map((n) => (
              <span key={n} className={n === 0 ? "pd-nav on" : "pd-nav"} />
            ))}
          </aside>
          <div className="pd-main">
            <div className="pd-top">
              <div>
                <div className="pd-kicker">{trade.single} · This month</div>
                <div className="pd-h">Jobs dashboard</div>
              </div>
              <span className="pd-avatar" />
            </div>
            <div className="pd-cards">
              <div className={"pd-card pd-rev" + (counting ? " hot" : countP >= 1 ? " done" : "")}>
                <span className="pd-label">Revenue booked</span>
                <b className="pd-num">{money(revenue)}</b>
                <span className="pd-delta">▲ {Math.round(40 + 122 * countP)}% vs last month</span>
                <div className="pd-bars">
                  {[0.35, 0.5, 0.42, 0.6, 0.55, 0.72, 0.68, 1].map((h, n) => (
                    <span key={n} style={{ height: `${Math.round((0.3 + 0.7 * Math.min(1, countP * 1.3)) * h * 100)}%` }} />
                  ))}
                </div>
              </div>
              <div className="pd-card">
                <span className="pd-label">New leads</span>
                <b className="pd-num">{41 + leads}</b>
              </div>
              <div className="pd-card">
                <span className="pd-label">Jobs won</span>
                <b className="pd-num">{18 + wins}</b>
              </div>
            </div>
            <div className="pd-list">
              {jobs.slice(0, 3).map((j, n) => (
                <div key={j.job} className="pd-row">
                  <span className="pd-dot" />
                  <span className="pd-job">
                    {j.job}
                    <small>{j.suburb}</small>
                  </span>
                  <span className="pd-val">{j.value}</span>
                  <span className={n === 0 ? "pd-pill won" : "pd-pill"}>{n === 0 ? "Booked" : "Quoted"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pd-toasts">
            {toasts.map((e) => (
              <div key={(e.won ? "w" : "l") + e.at} className={e.won ? "pd-toast won" : "pd-toast"}>
                <span className="pd-toast-ic" />
                <span>
                  <b>{e.won ? "New job won" : "New lead"}</b>
                  {e.won ? `${e.job.job} · ${e.job.value}` : `${e.job.job} · ${e.job.suburb}`}
                </span>
                <small>now</small>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt" aria-hidden="true" style={{ transform: `rotateY(${(into - 1) * 90}deg)` }}>
          <TextStage t={t} />
        </div>
      )}

      {/* End-card CTA: a real link, outside the aria-hidden stage, focusable only while shown. */}
      <a
        href="#start"
        className={"btn promo-cta" + (endCard ? " on" : "")}
        style={endCard ? { opacity: endFade } : undefined}
        tabIndex={endCard ? 0 : -1}
        aria-hidden={!endCard}
      >
        <span>See if you qualify</span>
      </a>

      {phase === "idle" && (
        <button type="button" className="promo-play" onClick={play}>
          <span className="promo-play-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>
          <span className="promo-play-label">
            Watch with sound
            <small>0:{String(Math.round(HOLD_AT)).padStart(2, "0")}</small>
          </span>
        </button>
      )}
      {phase === "playing" && PROMO_AUDIO && (
        <button type="button" className="promo-sound" onClick={toggleMute} aria-pressed={muted}>
          {muted ? "Unmute" : "Mute"}
        </button>
      )}
      {phase === "ended" && (
        <button type="button" className="promo-sound" onClick={play}>
          ↻ Watch again
        </button>
      )}
    </div>
  );
}

function TextStage({ t }: { t: number }) {
  if (t < SCRIPT_START) return null;
  if (t < END_CARD) {
    let n = 0;
    while (n + 1 < CUES.length && CUES[n + 1].at <= t) n++;
    return (
      <span key={n} className={"pt-line pt-cue pt-pop" + (/^\*[^*\s]+\*$/.test(CUES[n].text) ? " pt-hit" : "")}>
        {accented(CUES[n].text)}
      </span>
    );
  }
  // Picks up from "until your calendar is full"; the CTA button slides in under it.
  return (
    <div className="pt-end pt-pop" style={{ opacity: 1 - clamp01((t - (LOOP - 1)) / 0.9) }}>
      <LogoMark className="pt-end-x" />
      <span className="pt-line pt-end-line">
        Let&rsquo;s fill your <span className="accent">calendar.</span>
      </span>
    </div>
  );
}
