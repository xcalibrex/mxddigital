import { after, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseLead } from "@/lib/validate";
import type { LeadPayload } from "@/lib/lead";

// Lead capture: validate -> insert into Supabase `leads` -> n8n webhook (CRM + instant SMS/email).
// The webhook runs after the response so the visitor isn't kept waiting on the CRM. If the
// insert fails we call the webhook inline instead, so a lead is only lost if both are down.

function toRow(l: LeadPayload) {
  return {
    want_website: l.products.website,
    want_ads: l.products.ads,
    website_tier: l.websiteTier,
    ad_budget: l.adBudget,
    business: l.business,
    trade: l.trade,
    service_area: l.serviceArea,
    current_website: l.currentWebsite,
    name: l.name,
    phone: l.phone,
    email: l.email,
    terms_accepted: l.termsAccepted,
    utm_source: l.utm.source || null,
    utm_medium: l.utm.medium || null,
    utm_campaign: l.utm.campaign || null,
    utm_content: l.utm.content || null,
    utm_term: l.utm.term || null,
    landing_trade: l.landingTrade || null,
  };
}

async function insertLead(lead: LeadPayload): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[leads] Supabase env not set");
    return null;
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await db.from("leads").insert(toRow(lead)).select("id").single();
  if (error) {
    console.error("[leads] insert failed", error.message);
    return null;
  }
  return data.id as string;
}

async function notifyN8n(lead: LeadPayload, id: string | null): Promise<boolean> {
  const url = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!url) {
    console.error("[leads] N8N_LEAD_WEBHOOK_URL not set");
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ id, submittedAt: new Date().toISOString(), ...lead }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[leads] n8n responded", res.status);
    return res.ok;
  } catch (e) {
    console.error("[leads] n8n failed", e);
    return false;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot filled: pretend it worked, store nothing.
  if (body && typeof body === "object" && (body as { hp?: unknown }).hp) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseLead(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 422 });
  const { lead } = parsed;

  const id = await insertLead(lead);
  if (id) {
    after(() => notifyN8n(lead, id));
    return NextResponse.json({ ok: true });
  }

  const delivered = await notifyN8n(lead, null);
  if (delivered) return NextResponse.json({ ok: true });
  return NextResponse.json({ error: "Could not save your details" }, { status: 502 });
}
