import { notFound } from "next/navigation";
import { Landing } from "@/components/Landing";
import { TRADES, tradeIndex } from "@/lib/trades";

// Reached through the rewrite in next.config.ts: /?trade=plumbers -> /t/plumbers.
// Prerendered per trade; canonical stays "/" (set in the root layout).

export const dynamicParams = false;

export function generateStaticParams() {
  // Plural and singular, so /?trade=plumber works too.
  return TRADES.flatMap((t) => [{ trade: t.slug }, { trade: t.slug.replace(/s$/, "") }]);
}

export default async function TradePage({ params }: { params: Promise<{ trade: string }> }) {
  const { trade } = await params;
  const i = tradeIndex(trade);
  if (i < 0) notFound();
  return <Landing initialTrade={i} locked />;
}
