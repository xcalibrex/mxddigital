"use client";

import { TRADES } from "@/lib/trades";
import { useLanding } from "./LandingState";

export function Statement() {
  const { state } = useLanding();
  return (
    <section className="statement">
      <div className="wrap statement-inner">
        <h2 className="statement-title display">
          <span className="lit-l">Fewer tyre-kickers.</span>
          <span className="lit-l">More</span>
          <span className="lit-lo">
            <span className="sr-only">{TRADES[state.i].job}.</span>
            <span className="win" aria-hidden="true">
              <span className="track" style={{ transform: `translateY(calc(-${state.i} * var(--row) * var(--lines)))` }}>
                {TRADES.map((t) => (
                  <span key={t.slug}>{t.job}.</span>
                ))}
              </span>
            </span>
          </span>
        </h2>
      </div>
    </section>
  );
}
