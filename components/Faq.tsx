"use client";

import { useState } from "react";
import { PlusIcon } from "./Icons";

export const FAQS = [
  {
    q: "How does revenue share work?",
    a: "You pay your ad budget straight to Google and Meta. Instead of a management fee, we take an agreed share of the revenue from the work our ads bring in. We lock in the terms with you before anything goes live.",
  },
  {
    q: "Do I need both a website and ads?",
    a: "No. Use either on its own. They work best together: ads bring people in, and your website turns them into booked work.",
  },
  {
    q: "What does the monthly website fee cover?",
    a: "Hosting, security and content updates, so your site keeps working while you're on the tools. Bigger changes are quoted separately.",
  },
  { q: "How fast can my website go live?", a: "72 hours from when we have your details and photos." },
  { q: "Am I locked into a contract?", a: "No. There are no lock-in contracts. You stay because it's working." },
  {
    q: "Do I own my website?",
    a: "Your domain, content and photos are always yours. Your site runs on our hosting while you're with us, which covers security and updates. If you ever leave, we'll move it to your own hosting for a one-off $200 migration fee.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="wrap sec-tail has-arches">
      <div className="arches" aria-hidden="true" />
      <div className="faq-grid">
        <div className="faq-head reveal">
          <span className="tag">FAQ</span>
          <h2 className="faq-title display">
            Straight answers<span className="accent">.</span>
          </h2>
        </div>
        <div className="faq-list">
          {FAQS.map((x, n) => {
            const isOpen = open === n;
            return (
              <div key={x.q} className={isOpen ? "qa open" : "qa"}>
                <h3>
                  <button
                    type="button"
                    className="qa-btn"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${n}`}
                    id={`faq-q-${n}`}
                    onClick={() => setOpen(isOpen ? -1 : n)}
                  >
                    <span>{x.q}</span>
                    <span className="qa-ic" aria-hidden="true">
                      <PlusIcon />
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <p className="qa-a" id={`faq-${n}`} role="region" aria-labelledby={`faq-q-${n}`}>
                    {x.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
