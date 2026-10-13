import { Stars } from "./Icons";

// TODO(launch): real client names, metrics and one-liners. $100K / 30 days must be a real result.
const CASES = [
  {
    client: "[Client name] · Plumbing",
    hot: true,
    metrics: [
      { value: "$100K", label: "Booked work" },
      { value: "30", label: "Days" },
    ],
    note: "[One line on what we did: new site plus Google Ads in their service area.]",
  },
  {
    client: "[Client name] · Electrical",
    metrics: [
      { value: "[X]", label: "Jobs booked" },
      { value: "[X]x", label: "Return on ad spend", accent: true },
    ],
    note: "[One line on what we did.]",
  },
  {
    client: "[Client name] · Roofing",
    metrics: [
      { value: "$[X]K", label: "Booked work" },
      { value: "[N]", label: "Days", accent: true },
    ],
    note: "[One line on what we did.]",
  },
];

export function Results() {
  return (
    <section id="results" className="wrap sec-tail">
      <div className="reveal sec-head">
        <span className="tag">Results</span>
        <h2 className="sec-title display">
          Work booked. <span className="accent">Not clicks.</span>
        </h2>
      </div>
      <div className="cases">
        {CASES.map((c) => (
          <article key={c.client} className={c.hot ? "case case-hot reveal" : "case reveal"}>
            <span className={c.hot ? "case-client" : "small"}>{c.client}</span>
            <div className="case-metrics">
              {c.metrics.map((m) => (
                <div key={m.label}>
                  <div className={"metric display" + ("accent" in m && m.accent ? " accent" : "")}>{m.value}</div>
                  <div className="metric-label">{m.label}</div>
                </div>
              ))}
            </div>
            <p className="case-note">{c.note}</p>
          </article>
        ))}
      </div>

      <figure className="quote reveal">
        <Stars />
        <blockquote className="display">
          &ldquo;I showed the boys our new website and they couldn&rsquo;t get over it. They absolutely crushed it.&rdquo;
        </blockquote>
        <figcaption>
          <span className="quote-name">Nick</span>
          <span className="small" style={{ fontSize: 11 }}>
            Vary Projects, Brisbane &amp; Gold Coast
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
