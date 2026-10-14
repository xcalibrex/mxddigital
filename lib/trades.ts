export type Trade = {
  slug: string;
  /** Plural, as in "More leads for Plumbers." */
  trade: string;
  /** Job word in the statement section. */
  job: string;
  /** Form value, as in the Trade select and the lead payload. */
  single: string;
};

// Roofers first: the default page opens on them.
export const TRADES: Trade[] = [
  { slug: "roofers", trade: "Roofers", job: "Re-roof installations", single: "Roofing" },
  { slug: "plumbers", trade: "Plumbers", job: "Bathroom renovations", single: "Plumbing" },
  { slug: "builders", trade: "Builders", job: "Kitchen renovations", single: "Building" },
  { slug: "landscapers", trade: "Landscapers", job: "Backyard makeovers", single: "Landscaping" },
];

export const OTHER_TRADE = "Other trade";
export const TRADE_OPTIONS = [...TRADES.map((t) => t.single), OTHER_TRADE];

/** Accepts "plumbers" or "plumber"; returns -1 when the slug is unknown. */
export function tradeIndex(slug: string | undefined | null): number {
  if (!slug) return -1;
  const s = slug.toLowerCase();
  return TRADES.findIndex((t) => t.slug === s || t.slug === s + "s");
}

export const ROTATE_MS = 2800;
