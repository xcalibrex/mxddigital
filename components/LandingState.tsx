"use client";

import { createContext, useContext, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import { ROTATE_MS, TRADES } from "@/lib/trades";
import { UTM_KEYS, type Tier, type Utm } from "@/lib/lead";

export type Fields = {
  business: string;
  area: string;
  website: string;
  name: string;
  phone: string;
  email: string;
  terms: boolean;
};

export type State = {
  /** Current trade index. Drives the hero word, media label, statement job and form select. */
  i: number;
  /** Rotation stopped: ad-matched landing, a select change, or reduced motion. */
  picked: boolean;
  other: boolean;
  web: boolean;
  ads: boolean;
  tier: Tier;
  budget: number;
  step: number;
  err: string;
  sent: boolean;
  f: Fields;
};

export type Action =
  | { type: "tick" }
  | { type: "stopRotation" }
  | { type: "pickTrade"; index: number } // -1 = Other trade
  | { type: "set"; patch: Partial<State> }
  | { type: "field"; name: keyof Fields; value: string | boolean }
  | { type: "choose"; product: "web" | "ads" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tick":
      return s.picked ? s : { ...s, i: (s.i + 1) % TRADES.length };
    case "stopRotation":
      return s.picked ? s : { ...s, picked: true };
    case "pickTrade":
      return a.index >= 0 ? { ...s, i: a.index, picked: true, other: false } : { ...s, picked: true, other: true };
    case "set":
      return { ...s, ...a.patch };
    case "field":
      return { ...s, f: { ...s.f, [a.name]: a.value }, err: "" };
    case "choose":
      // From the Services panels: preselect the product and restart the wizard.
      return { ...s, [a.product]: true, step: 0, err: "", sent: false };
  }
}

type Ctx = {
  state: State;
  dispatch: Dispatch<Action>;
  /** Trade on screen when the visitor arrived. */
  landingTrade: string;
  utm: React.RefObject<Utm>;
};

const LandingContext = createContext<Ctx | null>(null);

export function useLanding() {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding outside LandingProvider");
  return ctx;
}

const UTM_STORE = "mxd_utm";
const emptyUtm = (): Utm => ({ source: "", medium: "", campaign: "", content: "", term: "" });

export function LandingProvider({ initialTrade, locked, children }: { initialTrade: number; locked: boolean; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    i: initialTrade,
    picked: locked,
    other: false,
    web: false,
    ads: false,
    tier: "simple",
    budget: -1,
    step: 0,
    err: "",
    sent: false,
    f: { business: "", area: "", website: "", name: "", phone: "", email: "", terms: false },
  }));
  const utm = useRef<Utm>(emptyUtm());

  // Auto-rotate the trade until something pins it.
  useEffect(() => {
    if (state.picked) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dispatch({ type: "stopRotation" });
      return;
    }
    const t = setInterval(() => dispatch({ type: "tick" }), ROTATE_MS);
    return () => clearInterval(t);
  }, [state.picked]);

  // Capture UTM parameters on first load. Keep the first-touch set for the session
  // so a reload or an in-page anchor jump that drops the query doesn't lose them.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = emptyUtm();
    let any = false;
    for (const k of UTM_KEYS) {
      const v = params.get("utm_" + k);
      if (v) {
        fromUrl[k] = v.slice(0, 200);
        any = true;
      }
    }
    try {
      const saved = sessionStorage.getItem(UTM_STORE);
      if (saved && !any) {
        utm.current = { ...emptyUtm(), ...JSON.parse(saved) };
        return;
      }
      if (any) sessionStorage.setItem(UTM_STORE, JSON.stringify(fromUrl));
    } catch {
      // Storage blocked: the URL values still apply for this page view.
    }
    utm.current = fromUrl;
  }, []);

  return (
    <LandingContext.Provider value={{ state, dispatch, landingTrade: TRADES[initialTrade].trade, utm }}>
      {children}
    </LandingContext.Provider>
  );
}
