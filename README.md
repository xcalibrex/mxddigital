# MXD Digital landing page

Next.js 16 (App Router) + TypeScript, plain CSS, deployed on Vercel. Built from
`MXD-landing-design.dc.html`. The display font is Unbounded 400 (it replaces the
design's Bebas Neue, following the Agencee reference); the body font is DM Sans.

```bash
pnpm install
cp .env.example .env.local   # then fill it in
pnpm dev
```

## Structure

| Path | What |
|---|---|
| `app/globals.css` | All styles and motion, ported from the design file |
| `components/LandingState.tsx` | Shared state: trade index, rotation, wizard, UTM capture |
| `components/Wizard.tsx` | The lead form |
| `app/api/leads/route.ts` | Validates the lead and posts it to the n8n webhook |
| `lib/trades.ts` | Trades, job words and form values |
| `lib/promo.ts` | Hero promo timeline, script cues and dashboard jobs |

## Ad-matched landing

`/?trade=roofers` (also `plumbers`, `builders`, `landscapers`, plus the
singular forms) starts on that trade and does not auto-rotate. A rewrite in
`next.config.ts` serves a prerendered `/t/<trade>` page, so the right trade is in the
first paint. Unknown values fall back to the default page. UTM parameters are read
client-side on first load and kept for the session.

## Lead pipeline

There is no database. n8n is the system of record: it parses the lead into the CRM and
sends the instant acknowledgement.

1. `POST /api/leads` validates the wizard payload (and drops honeypot hits).
2. It posts `{ submittedAt, ...payload }` to `N8N_LEAD_WEBHOOK_URL`, with an
   `X-Webhook-Secret` header if `N8N_WEBHOOK_SECRET` is set. One retry on a network
   error or 5xx. The visitor only sees the thank-you screen once n8n returns 2xx.

Use the production `/webhook/` URL in Vercel; `/webhook-test/` only works while the
workflow is listening in the n8n editor.

On success the wizard pushes `{ event: "lead_submitted" }` to `window.dataLayer` for
GTM / Google Ads conversion tracking. It does nothing until a tag is installed.

## Hero promo

`components/Promo.tsx` plays the dashboard → flip → pitch sequence; `lib/promo.ts` holds the
timeline. The soundtrack (`public/promo/vo.mp3`) is built from the source takes with:

```bash
pnpm promo:audio --lead lead.wav --won won.wav --pitch pitch.mp3 --closer closer.mp3 \
  --music-dash Hypnotic_Pulse_Study.mp3 \
  --music-pitch East_Coast_Drive_-_Intro_Beat.mp3 --music-pitch-from 5 --music-pitch-to 27 \
  --music-pitch-loop 5.17:2.6374 \
  --riser soundreality-riser-wildfire-285209.mp3 --riser-peak 7.0
```

Lead/won lines: Hannah (cut from one ElevenLabs file). Pitch and closer ("for ads" version): Mike, take 1 of each. The beat loop is whole bars at 91 BPM from its first downbeat. If the pitch take
changes, re-transcribe it and update the word times in `lib/promo.ts`.

## Before launch

Search for `TODO(launch)`: the terms and conditions link on the form, and a GST basis
(inc. or ex.) for the prices. Set `N8N_LEAD_WEBHOOK_URL` in Vercel. The $200 migration fee in the FAQ is a
proposal; confirm it.
