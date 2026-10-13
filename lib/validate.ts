import { TRADE_OPTIONS } from "./trades";
import { BUDGETS, EMAIL_RE, UTM_KEYS, type LeadPayload, type Utm } from "./lead";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Server-side check of the wizard payload. Returns the cleaned lead or an error message. */
export function parseLead(body: unknown): { lead: LeadPayload } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const products = (b.products ?? {}) as Record<string, unknown>;
  const website = products.website === true;
  const ads = products.ads === true;
  if (!website && !ads) return { error: "Choose a website, ads, or both." };

  const websiteTier = website ? (b.websiteTier === "premium" ? "premium" : b.websiteTier === "simple" ? "simple" : null) : null;
  if (website && !websiteTier) return { error: "Choose a website package." };

  const adBudget = ads ? BUDGETS.find((x) => x === b.adBudget) ?? null : null;
  if (ads && !adBudget) return { error: "Choose a monthly budget." };

  const trade = str(b.trade, 40);
  const lead: LeadPayload = {
    products: { website, ads },
    websiteTier,
    adBudget,
    business: str(b.business, 160),
    trade: TRADE_OPTIONS.includes(trade) ? trade : "Other trade",
    serviceArea: str(b.serviceArea, 200),
    currentWebsite: str(b.currentWebsite, 300) || null,
    name: str(b.name, 120),
    phone: str(b.phone, 40),
    email: str(b.email, 200),
    termsAccepted: b.termsAccepted === true,
    utm: Object.fromEntries(UTM_KEYS.map((k) => [k, str((b.utm as Record<string, unknown> | undefined)?.[k], 200)])) as Utm,
    landingTrade: str(b.landingTrade, 40),
  };

  if (!lead.business || !lead.serviceArea) return { error: "Add your business name and service area." };
  if (!lead.name || !lead.phone || !EMAIL_RE.test(lead.email)) return { error: "Add your name, phone and a valid email." };
  if (!lead.termsAccepted) return { error: "Please agree to the terms and conditions." };
  return { lead };
}
