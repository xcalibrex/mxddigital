"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode, type Ref } from "react";
import { OTHER_TRADE, TRADES, TRADE_OPTIONS } from "@/lib/trades";
import { BUDGETS, EMAIL_RE, type LeadPayload } from "@/lib/lead";
import { useLanding, type Fields, type State } from "./LandingState";

type StepKey = "need" | "tier" | "budget" | "biz" | "details";

function stepsFor(s: Pick<State, "web" | "ads">): StepKey[] {
  const list: StepKey[] = ["need"];
  if (s.web) list.push("tier");
  if (s.ads) list.push("budget");
  list.push("biz", "details");
  return list;
}

/** Fields that fail validation on a step. Empty array = step is valid. */
function invalidFields(key: StepKey, s: State): (keyof Fields | "need" | "budget")[] {
  const f = s.f;
  switch (key) {
    case "need":
      return !s.web && !s.ads ? ["need"] : [];
    case "budget":
      return s.budget < 0 ? ["budget"] : [];
    case "biz":
      return (["business", "area"] as const).filter((k) => !f[k].trim());
    case "details": {
      const bad: (keyof Fields)[] = (["name", "phone"] as const).filter((k) => !f[k].trim());
      if (!EMAIL_RE.test(f.email.trim())) bad.push("email");
      if (!f.terms) bad.push("terms");
      return bad;
    }
    default:
      return [];
  }
}

const ERRORS: Record<StepKey, string> = {
  need: "Choose a website, ads, or both.",
  tier: "",
  budget: "Choose a monthly budget.",
  biz: "Add your business name and service area.",
  details: "Add your name, phone and a valid email.",
};

const TERMS_ERROR = "Please agree to the terms and conditions.";

const AUTO_ADVANCE_MS = 420;

function Question({ children, ref }: { children: ReactNode; ref: Ref<HTMLHeadingElement> }) {
  return (
    <h2 className="q display" tabIndex={-1} ref={ref}>
      {children}
    </h2>
  );
}

export function Wizard() {
  const { state: s, dispatch, landingTrade, utm } = useLanding();
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(s);
  latest.current = s;

  const steps = stepsFor(s);
  const step = Math.min(s.step, steps.length - 1);
  const key = steps[step];
  const isLast = step === steps.length - 1;
  const bad = s.err ? invalidFields(key, s) : [];
  const tradeValue = s.other ? OTHER_TRADE : TRADES[s.i].single;

  useEffect(() => () => clearTimeout(autoTimer.current), []);

  // Move focus to the new question on every step change (not on first render), and
  // bring the form back into view if a tall step left its top above the fold on a phone.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const top = formRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) formRef.current?.scrollIntoView({ block: "start" });
  }, [step, s.sent]);

  const goTo = (n: number) => dispatch({ type: "set", patch: { step: n, err: "" } });

  const autoNext = (k: StepKey) => {
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      const cur = latest.current;
      if (stepsFor(cur)[cur.step] === k) goTo(cur.step + 1);
    }, AUTO_ADVANCE_MS);
  };

  const submit = async () => {
    const f = s.f;
    const payload: LeadPayload = {
      products: { website: s.web, ads: s.ads },
      websiteTier: s.web ? s.tier : null,
      adBudget: s.ads ? BUDGETS[s.budget] : null,
      business: f.business.trim(),
      trade: tradeValue,
      serviceArea: f.area.trim(),
      currentWebsite: f.website.trim() || null,
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      termsAccepted: f.terms,
      utm: utm.current,
      landingTrade,
    };
    const hp = new FormData(formRef.current ?? undefined).get("company_url");

    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, hp: typeof hp === "string" ? hp : "" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      // Conversion hook for GTM / Google Ads. No-op until a tag manager is installed.
      const w = window as unknown as { dataLayer?: unknown[] };
      w.dataLayer?.push({ event: "lead_submitted", products: payload.products, trade: payload.trade });
      dispatch({ type: "set", patch: { sent: true, err: "" } });
    } catch {
      dispatch({ type: "set", patch: { err: "Something went wrong sending that. Please try again, or give us a call." } });
    } finally {
      setBusy(false);
    }
  };

  const advance = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    clearTimeout(autoTimer.current);
    const invalid = invalidFields(key, s);
    if (invalid.length) {
      const onlyTerms = invalid.length === 1 && invalid[0] === "terms";
      dispatch({ type: "set", patch: { err: onlyTerms ? TERMS_ERROR : ERRORS[key] } });
      return;
    }
    if (isLast) void submit();
    else goTo(step + 1);
  };

  if (s.sent) {
    const first = s.f.name.trim().split(/\s+/)[0];
    return (
      <div className="stepin thanks" role="status">
        <h2 className="thanks-title display" tabIndex={-1} ref={headingRef}>
          Thanks, {first || "mate"}
          <span className="accent">.</span>
        </h2>
        <p>We&#39;ve got your details. Expect a call from the MXD team within 24 hours to let you know if you qualify.</p>
      </div>
    );
  }

  const progress = Math.round(((step + 1) / steps.length) * 100);
  const errId = "wiz-err";
  const field = (name: keyof Fields) => ({
    value: s.f[name] as string,
    onChange: (e: { target: { value: string } }) => dispatch({ type: "field", name, value: e.target.value }),
    "aria-invalid": bad.includes(name) || undefined,
    "aria-describedby": bad.includes(name) ? errId : undefined,
  });

  return (
    <form ref={formRef} onSubmit={advance} noValidate className="wiz">
      <div className="wiz-top">
        <div className="wiz-meta">
          <span>Get started</span>
          <span>
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <div className="bar" role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="bar-fill" style={{ width: progress + "%" }} />
        </div>
      </div>

      {/* Honeypot: off-screen, skipped by keyboard and autofill. Bots fill it, people don't. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company-url">Leave this empty</label>
        <input id="f-company-url" name="company_url" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="wiz-body">
        {key === "need" && (
          <div className="stepin step" key="need">
            <Question ref={headingRef}>
              What do you need<span className="accent">?</span>
            </Question>
            <div className="grid2">
              <button
                type="button"
                className={s.web ? "opt on" : "opt"}
                aria-pressed={s.web}
                onClick={() => dispatch({ type: "set", patch: { web: !s.web, err: "" } })}
              >
                <span className="opt-t">Website</span>
                <span className="opt-p">From $499</span>
              </button>
              <button
                type="button"
                className={s.ads ? "opt on" : "opt"}
                aria-pressed={s.ads}
                onClick={() => dispatch({ type: "set", patch: { ads: !s.ads, err: "" } })}
              >
                <span className="opt-t">Ads</span>
                <span className="opt-p">Revenue share</span>
              </button>
            </div>
          </div>
        )}

        {key === "tier" && (
          <div className="stepin step" key="tier">
            <Question ref={headingRef}>
              Which website<span className="accent">?</span>
            </Question>
            <div className="grid2">
              {(
                [
                  ["simple", "Simple", "$499 + $99/mo"],
                  ["premium", "Premium", "$1,999 + $199/mo"],
                ] as const
              ).map(([k, name, price]) => (
                <button
                  key={k}
                  type="button"
                  className={s.tier === k ? "opt on" : "opt"}
                  aria-pressed={s.tier === k}
                  onClick={() => {
                    dispatch({ type: "set", patch: { tier: k, err: "" } });
                    autoNext("tier");
                  }}
                >
                  <span className="opt-t">{name}</span>
                  <span className="opt-p">{price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {key === "budget" && (
          <div className="stepin step" key="budget">
            <Question ref={headingRef}>
              Monthly ad budget<span className="accent">?</span>
            </Question>
            <div role="group" aria-label="Monthly ad budget" className="grid2">
              {BUDGETS.map((label, n) => (
                <button
                  key={label}
                  type="button"
                  className={n === s.budget ? "chip on" : "chip"}
                  aria-pressed={n === s.budget}
                  onClick={() => {
                    dispatch({ type: "set", patch: { budget: n, err: "" } });
                    autoNext("budget");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {key === "biz" && (
          <div className="stepin step" key="biz">
            <Question ref={headingRef}>
              About your business<span className="accent">.</span>
            </Question>
            <div className="fields">
              <div className="fl">
                <label htmlFor="f-biz">Business name</label>
                <input id="f-biz" name="business" className="inp" type="text" autoComplete="organization" required maxLength={160} {...field("business")} />
              </div>
              <div className="fl">
                <label htmlFor="f-trade">Trade</label>
                <select
                  id="f-trade"
                  name="trade"
                  className="inp"
                  value={tradeValue}
                  onChange={(e) => dispatch({ type: "pickTrade", index: TRADES.findIndex((t) => t.single === e.target.value) })}
                >
                  {TRADE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fl">
                <label htmlFor="f-area">Service area</label>
                <input id="f-area" name="area" className="inp" type="text" placeholder="e.g. Northern suburbs, Melbourne" required maxLength={200} {...field("area")} />
              </div>
              <div className="fl">
                <label htmlFor="f-site">
                  Current website <span>(if you have one)</span>
                </label>
                <input id="f-site" name="website" className="inp" type="text" inputMode="url" autoComplete="url" placeholder="yourbusiness.com.au" maxLength={300} {...field("website")} />
              </div>
            </div>
          </div>
        )}

        {key === "details" && (
          <div className="stepin step" key="details">
            <Question ref={headingRef}>
              Where do we send your results<span className="accent">?</span>
            </Question>
            <div className="fields">
              <div className="fl">
                <label htmlFor="f-name">Your name</label>
                <input id="f-name" name="name" className="inp" type="text" autoComplete="name" required maxLength={120} {...field("name")} />
              </div>
              <div className="fl">
                <label htmlFor="f-phone">Phone</label>
                <input id="f-phone" name="phone" className="inp" type="tel" autoComplete="tel" required maxLength={40} {...field("phone")} />
              </div>
              <div className="fl">
                <label htmlFor="f-email">Email</label>
                <input id="f-email" name="email" className="inp" type="email" autoComplete="email" required maxLength={200} {...field("email")} />
              </div>
            </div>
            <div className="optin">
              <input
                id="f-terms"
                name="terms"
                className="chk"
                type="checkbox"
                required
                checked={s.f.terms}
                aria-invalid={bad.includes("terms") || undefined}
                aria-describedby={bad.includes("terms") ? errId : undefined}
                onChange={(e) => dispatch({ type: "field", name: "terms", value: e.target.checked })}
              />
              {/* TODO(launch): link "terms and conditions" to the real terms page */}
              <label htmlFor="f-terms">I agree to the terms and conditions</label>
            </div>
          </div>
        )}
      </div>

      {s.err && (
        <p role="alert" id={errId} className="wiz-err">
          {s.err}
        </p>
      )}

      <div className="wiz-nav">
        {step > 0 && (
          <button
            type="button"
            className="back"
            onClick={() => {
              clearTimeout(autoTimer.current);
              goTo(Math.max(0, step - 1));
            }}
          >
            ← Back
          </button>
        )}
        <button type="submit" className="next" disabled={busy}>
          <span>{busy ? "Sending" : isLast ? "See if I qualify" : "Next"}</span>
        </button>
      </div>
    </form>
  );
}

export function WizardSection() {
  return (
    <section id="start" className="sheet-sec">
      <div className="wrap">
        <div className="sheet">
          <Wizard />
        </div>
      </div>
    </section>
  );
}
