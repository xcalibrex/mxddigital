import Image from "next/image";
import { Stars } from "./Icons";

const SITES = [
  {
    client: "Vary Projects",
    meta: "Fitouts · Brisbane & Gold Coast",
    front: "/work/vary-home.jpg",
    back: "/work/vary-project.jpg",
    alt: "Vary Projects homepage",
  },
  {
    client: "Weldridge Constructions",
    meta: "Civil construction · Queensland",
    front: "/work/weldridge-home.jpg",
    back: "/work/weldridge-about.jpg",
    alt: "Weldridge Constructions homepage",
  },
];

export function Work() {
  return (
    <section id="work" className="wrap sec-tail">
      <div className="reveal sec-head">
        <span className="tag">Our work</span>
        <h2 className="sec-title display">
          Websites we&rsquo;ve <span className="accent">built.</span>
        </h2>
      </div>
      <div className="work-grid">
        {SITES.map((s, n) => (
          <article key={s.client} className={"work-card reveal" + (n % 2 ? " work-alt" : "")}>
            {/* Page stack: second page underneath, homepage on top, tilted like prints on a desk */}
            <div className="work-stage" aria-hidden="true">
              <div className="work-stack">
                <span className="work-sheet work-sheet-3" />
                <span className="work-sheet work-sheet-2">
                  <Image src={s.back} alt="" fill sizes="(max-width: 767px) 80vw, 560px" />
                </span>
                <span className="work-sheet work-sheet-1">
                  <Image src={s.front} alt="" fill sizes="(max-width: 767px) 80vw, 560px" />
                </span>
              </div>
            </div>
            <div className="work-cap">
              <h3 className="display">{s.client}</h3>
              <span className="small">{s.meta}</span>
            </div>
            <span className="sr-only">{s.alt}</span>
          </article>
        ))}
      </div>

      <figure className="quote reveal">
        <Stars />
        <blockquote className="display">
          &ldquo;I showed the boys our new website and they couldn&rsquo;t get over it. MXD absolutely crushed it.&rdquo;
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
