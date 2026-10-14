import { NextResponse } from "next/server";
import { parseLead } from "@/lib/validate";
import type { LeadPayload } from "@/lib/lead";

// Lead capture: validate, then hand straight to the n8n webhook, which pushes the lead
// into the CRM and sends the instant SMS/email acknowledgement. n8n is the only place the
// lead goes, so the visitor only sees success once n8n has accepted it.

async function sendToN8n(lead: LeadPayload): Promise<boolean> {
  const url = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!url) {
    console.error("[leads] N8N_LEAD_WEBHOOK_URL not set");
    return false;
  }
  const body = JSON.stringify({ submittedAt: new Date().toISOString(), ...lead });
  const headers = {
    "Content-Type": "application/json",
    ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}),
  };
  // One retry for a transient blip; a lead lost here is lost for good.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(8000) });
      if (res.ok) return true;
      console.error(`[leads] n8n responded ${res.status} (attempt ${attempt})`);
      if (res.status < 500) return false;
    } catch (e) {
      console.error(`[leads] n8n failed (attempt ${attempt})`, e);
    }
  }
  return false;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot filled: pretend it worked, send nothing.
  if (body && typeof body === "object" && (body as { hp?: unknown }).hp) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseLead(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 422 });

  if (await sendToN8n(parsed.lead)) return NextResponse.json({ ok: true });
  return NextResponse.json({ error: "Could not send your details" }, { status: 502 });
}
