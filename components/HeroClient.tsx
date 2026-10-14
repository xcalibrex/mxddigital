"use client";

import { TRADES } from "@/lib/trades";
import { useLanding } from "./LandingState";
import { Promo } from "./Promo";

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
  return (
    <div className="media expand">
      <Promo />
    </div>
  );
}
