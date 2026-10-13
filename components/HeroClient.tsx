"use client";

import Image from "next/image";
import { TRADES } from "@/lib/trades";
import { useLanding } from "./LandingState";
import { CameraIcon } from "./Icons";

export function TradeWord() {
  const { state } = useLanding();
  // Keyed on the index so the highlight wipe and word rise replay for every trade.
  return (
    <span className="hl" key={state.i}>
      <span className="hl-in">{TRADES[state.i].trade}</span>
    </span>
  );
}

export function HeroMediaFrame() {
  const { state } = useLanding();
  const t = TRADES[state.i];
  return (
    <div className="media expand" role="img" aria-label={t.photo}>
      {t.image ? (
        // next/image serves AVIF/WebP at the right width and lazy-loads by default.
        // For a showreel, swap this for <video muted loop playsInline autoPlay poster=...>.
        <Image key={t.slug} src={t.image} alt="" fill sizes="(max-width: 1360px) 100vw, 1360px" className="swap" />
      ) : (
        <div className="media-ph">
          <CameraIcon />
          <span className="small">[Photo or showreel] {t.photo}</span>
        </div>
      )}
    </div>
  );
}
