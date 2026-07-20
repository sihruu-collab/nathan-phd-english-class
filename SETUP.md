# Setup: hosting + payments

This site now has a real checkout (`checkout.html`) that accepts Card, Kakao Pay,
Naver Pay, and Toss Pay through Toss Payments' Payment Widget, plus a small
serverless backend (`/api`) that confirms payments and a Supabase database that
stores bookings.

Three free accounts are needed before this goes live. You need to create these
yourself (sign-ups require your own info/agreement to terms), but every step
after that — wiring up keys, deploying — I can do for you.

## 1. Toss Payments (payment methods)

1. Go to https://developers.tosspayments.com and sign up.
2. In the developer dashboard you'll immediately get **test** API keys (no
   business registration needed yet) — a client key (`test_gck_...`) and a
   secret key (`test_sk_...`).
3. Open [js/checkout.js](js/checkout.js) and replace the placeholder
   `TOSS_CLIENT_KEY` value near the top with your test client key. (This key
   is meant to be public/embedded in frontend code — same idea as a Stripe
   "publishable key".)
4. Give me the **secret key** — it goes into a Vercel environment variable
   (`TOSS_SECRET_KEY`), never committed to the repo.
5. **To go live later**: once your business registration (사업자등록증) is
   approved by Toss and you have a signed merchant contract, you'll get live
   keys (`live_gck_...` / `live_sk_...`). Swap the client key in
   `js/checkout.js` and update the `TOSS_SECRET_KEY` env var in Vercel — no
   other code changes needed.

## 2. Supabase (stores bookings/orders)

1. Go to https://supabase.com and create a free project.
2. Once it's created, open **SQL Editor** → **New query**, paste the contents
   of [supabase/schema.sql](supabase/schema.sql), and run it. This creates the
   `orders` table.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role key** (NOT the `anon`/public key) → this is
     `SUPABASE_SERVICE_KEY`
4. Give me both values — they go into Vercel environment variables. The
   service_role key must stay server-side only; it's never used in the
   browser.
5. Any time you want to see bookings, go to **Table Editor → orders** in the
   Supabase dashboard — no coding needed.

## 3. Vercel (hosting)

1. Go to https://vercel.com and sign up, easiest with your GitHub account.
2. Import the `sihruu-collab/nathan-phd-english-class` repo as a new project.
   The site is static HTML plus a couple of `/api` functions, so Vercel's
   defaults work with no build configuration.
3. Before (or right after) the first deploy, go to **Project Settings →
   Environment Variables** and add:
   - `TOSS_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Deploy. Vercel gives you a free `*.vercel.app` URL immediately; a custom
   domain can be attached later under **Project Settings → Domains**.

## Once you have the accounts

Send me:
- Toss test client key + test secret key
- Supabase project URL + service_role key

...and I'll drop the client key into the code, and either walk you through
adding the other three as Vercel env vars, or do it directly if you connect
me to the Vercel project.

## Testing (test mode, before going live)

Toss's test keys don't move real money. Use the test card numbers and
test-mode Kakao Pay/Naver Pay flows listed on Toss's own testing guide
(inside the developer dashboard) to walk through a full purchase and confirm:
- an `orders` row appears in Supabase as `pending`
- after completing test payment, it flips to `paid` with a `toss_payment_key`
- cancelling mid-payment lands you on `fail.html`
