-- Leads from the MXD Digital landing page wizard.
-- Written only by the Next.js route handler using the service role key.
-- RLS is on with no policies, so anon/authenticated clients can neither read nor write.

create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  status           text not null default 'new',

  want_website     boolean not null default false,
  want_ads         boolean not null default false,
  website_tier     text check (website_tier in ('simple', 'premium')),
  ad_budget        text check (ad_budget in ('Under $1,500/mo', '$1,500 - $5,000/mo', '$5,000 - $10,000/mo', '$10k+/mo')),

  business         text not null,
  trade            text not null,
  service_area     text not null,
  current_website  text,

  name             text not null,
  phone            text not null,
  email            text not null,
  terms_accepted   boolean not null default false,

  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_content      text,
  utm_term         text,
  landing_trade    text,

  constraint leads_wants_something check (want_website or want_ads)
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
