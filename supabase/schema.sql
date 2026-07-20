-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- to create the table that stores bookings/orders.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  toss_order_id text unique not null,
  service text not null,
  package_key text not null,
  package_label text not null,
  amount integer not null,
  customer_name text not null,
  phone text not null,
  email text not null,
  preferred_date date not null,
  preferred_time text not null,
  status text not null default 'pending',
  toss_payment_key text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
-- No policies are defined on purpose: only the Supabase service_role key
-- (used by the Vercel serverless functions, never exposed to the browser)
-- can read or write this table. The public/anon key has zero access to it.
