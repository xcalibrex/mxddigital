"use client";

import { useLanding } from "./LandingState";

const TIERS = {
  simple: {
    name: "Simple",
    price: "$499",
    monthly: "$99",
    copy: "One page, built to book jobs.",
    feats: ["One page, built for your trade", "Click-to-call and a quote form", "Hosting, security and updates included"],
  },
  premium: {
    name: "Premium",
    price: "$1,999",
    monthly: "$199",
    copy: "A full site that wins your area.",
    feats: ["A page for every service and suburb", "Reviews, gallery and licence up front", "Hosting, updates and a monthly report"],
  },
} as const;

export function Services() {
  const { state, dispatch } = useLanding();
  const tier = TIERS[state.tier];

  return (
    <section id="services" className="aurora-sec">
      {/* Pattern first so the aurora glows over it */}
      <div className="arches" aria-hidden="true" />
      <div className="aurora" aria-hidden="true">
        <span className="glow-a" />
        <span className="glow-b" />
        <span className="glow-c" />
      </div>
      <div className="wrap sec">
        <div className="reveal sec-head">
          <span className="tag">Services</span>
          <h2 className="sec-title display">
            <span className="ln">Ads bring them in.</span> <span className="ln accent">Website books the job.</span>
          </h2>
        </div>

        <div className="engines">
          <div className="engine engine-hot reveal">
            <span className="engine-kicker">High-performance marketing</span>
            <span className="engine-word display">Ads</span>
            <p className="engine-copy">Google and Meta ads for the jobs you want, where you work.</p>
            <ul className="feat dk">
              <li>You set the monthly budget</li>
              <li>No retainer, no management fee</li>
              <li>We earn a share of the revenue we bring in</li>
            </ul>
            <div className="engine-foot">
              <div className="engine-price">
                <span className="engine-price-label">Pricing</span>
                <span className="engine-price-ads display">Revenue share</span>
              </div>
              <a href="#start" className="btn on-orange" onClick={() => dispatch({ type: "choose", product: "ads" })}>
                <span>Start with ads</span>
              </a>
            </div>
          </div>

          <div className="engine engine-dark reveal">
            <span className="engine-kicker">Built to convert</span>
            <span className="engine-word display">Websites</span>
            <div role="group" aria-label="Website package" className="tabs">
              {(["simple", "premium"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={state.tier === k ? "tabb on" : "tabb"}
                  aria-pressed={state.tier === k}
                  onClick={() => dispatch({ type: "set", patch: { tier: k } })}
                >
                  {TIERS[k].name}
                </button>
              ))}
            </div>
            <div className="swap swap-body" key={state.tier}>
              <p className="engine-copy">{tier.copy}</p>
              <ul className="feat">
                {tier.feats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="engine-foot">
              <div className="engine-price">
                <span className="engine-price-label">+ {tier.monthly}/mo management</span>
                <span className="engine-price-web display">{tier.price}</span>
              </div>
              <a href="#start" className="btn" onClick={() => dispatch({ type: "choose", product: "web" })}>
                <span>Choose {tier.name}</span>
              </a>
            </div>
          </div>

          <div className="plus spin" aria-hidden="true">
            <span>+</span>
          </div>
        </div>
        {/* TODO(launch): prices need a GST basis (inc. or ex.) shown somewhere before launch */}
      </div>
    </section>
  );
}
