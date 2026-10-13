export const BUDGETS = ["Under $1,500/mo", "$1,500 - $5,000/mo", "$5,000 - $10,000/mo", "$10k+/mo"] as const;
export type Budget = (typeof BUDGETS)[number];
export type Tier = "simple" | "premium";

export const UTM_KEYS = ["source", "medium", "campaign", "content", "term"] as const;
export type Utm = Record<(typeof UTM_KEYS)[number], string>;

export type LeadPayload = {
  products: { website: boolean; ads: boolean };
  websiteTier: Tier | null;
  adBudget: Budget | null;
  business: string;
  trade: string;
  serviceArea: string;
  currentWebsite: string | null;
  name: string;
  phone: string;
  email: string;
  termsAccepted: boolean;
  utm: Utm;
  landingTrade: string;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
