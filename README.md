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
| `app/api/leads/route.ts` | Validates the lead, inserts it into Supabase, calls the n8n webhook |
| `lib/trades.ts` | Trades, job words, form values, hero photo paths |
| `supabase/migrations/` | `leads` table |

## Ad-matched landing

`/?trade=plumbers` (also `electricians`, `roofers`, `builders`, `landscapers`, plus the
singular forms) starts on that trade and does not auto-rotate. A rewrite in
`next.config.ts` serves a prerendered `/t/<trade>` page, so the right trade is in the
first paint. Unknown values fall back to the default page. UTM parameters are read
client-side on first load and kept for the session.

## Lead pipeline

1. `POST /api/leads` gets the payload from the handoff spec, plus a honeypot field.
2. The lead is inserted into `public.leads` with the service role key. RLS is on and
   there are no policies, so browsers can't read the table.
3. The n8n webhook gets `{ id, submittedAt, ...payload }` with an `X-Webhook-Secret`
   header. This runs after the response is sent. If the insert fails, the webhook is
   called inline instead, so a lead is lost only if both are down.

Apply the migration with `supabase db push`, or paste it into the SQL editor.

On success the wizard pushes `{ event: "lead_submitted" }` to `window.dataLayer` for
GTM / Google Ads conversion tracking. It does nothing until a tag is installed.

## Hero photos

Put one image per trade in `public/hero/` and set `image` in `lib/trades.ts`
(for example `"/hero/plumbers.jpg"`). `next/image` serves AVIF/WebP and lazy-loads
it. For a showreel, swap the `<Image>` in `components/HeroClient.tsx` for a muted,
looping `<video>` with a poster.

## Before launch

Search for `TODO(launch)`: hero photos, case studies (the $100K / 30 days result
must be real), FAQ answers, the terms and conditions link on the form, and a GST
basis (inc. or ex.) for the prices.
