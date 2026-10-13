import { MegaphoneIcon } from "./Icons";
import { HeroMediaFrame, TradeWord } from "./HeroClient";

export function Hero() {
  return (
    <section id="top" className="hero wrap">
      <p className="eyebrow fade d0">
        High Performance Digital Marketing <span className="eb-tail">for Tradies</span>
      </p>
      <h1 className="hero-title display">
        <span className="line">
          <span className="rise d1">More leads for</span>
        </span>
        <span className="line">
          <span className="rise d2">
            <span className="badge" aria-hidden="true">
              <MegaphoneIcon />
            </span>{" "}
            <TradeWord />.
          </span>
        </span>
      </h1>
      <p className="hero-sub fade d3">
        Ads that pay for themselves.
        <br />
        Websites that convert.
      </p>
      <div className="hero-cta fade d4" id="hero-cta">
        <a href="#start" className="btn">
          <span>Get started</span>
        </a>
      </div>
    </section>
  );
}

export function HeroMedia() {
  return (
    <section className="media-section wrap">
      {/* The fade lives on a wrapper: on the same element, .expand's scroll animation
          would override .fade's and leave the block stuck at opacity 0. */}
      <div className="fade d5">
        <HeroMediaFrame />
      </div>
    </section>
  );
}
