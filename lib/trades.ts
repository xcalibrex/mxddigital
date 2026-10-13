export type Trade = {
  slug: string;
  /** Plural, as in "More leads for Plumbers." */
  trade: string;
  /** Job word in the statement section. */
  job: string;
  /** Form value, as in the Trade select and the lead payload. */
  single: string;
  /** Alt text / label for the hero media. */
  photo: string;
  /** Optional hero photo in /public. Leave null until the real shot exists. */
  image: string | null;
};

export const TRADES: Trade[] = [
  { slug: "plumbers", trade: "Plumbers", job: "Blocked drains", single: "Plumbing", photo: "Plumber on the job", image: null },
  { slug: "electricians", trade: "Electricians", job: "Switchboard upgrades", single: "Electrical", photo: "Electrician on the job", image: null },
  { slug: "roofers", trade: "Roofers", job: "Roof restorations", single: "Roofing", photo: "Roofer on the job", image: null },
  { slug: "builders", trade: "Builders", job: "Extensions", single: "Building", photo: "Builder on the job", image: null },
  { slug: "landscapers", trade: "Landscapers", job: "Backyard makeovers", single: "Landscaping", photo: "Landscaper on the job", image: null },
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
