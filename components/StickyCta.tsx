"use client";

import { useEffect, useState } from "react";

/** Mobile only (CSS hides it at 768px+). Shows once the hero button has scrolled
 *  away, hides again while the form is on screen. */
export function StickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const form = document.getElementById("start");
    if (!hero || !form) return;
    const ho = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
    const fo = new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    ho.observe(hero);
    fo.observe(form);
    return () => {
      ho.disconnect();
      fo.disconnect();
    };
  }, []);

  const show = pastHero && !atForm;
  return (
    <div className={show ? "sticky-cta show" : "sticky-cta"} aria-hidden={!show}>
      <a href="#start" className="btn" tabIndex={show ? 0 : -1}>
        <span>Get started</span>
      </a>
    </div>
  );
}
