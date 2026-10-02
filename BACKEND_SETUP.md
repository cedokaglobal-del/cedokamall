# Backend & Security Setup

Run these in order. Each file is re-runnable, so it is safe to run a file twice.

---

## 1. `SUPABASE_PRODUCTION_SETUP.sql` (if not already applied)

Defines `public.is_admin()` and the base tables. Everything below depends on it.

---

## 2. `REVIEWS_SETUP.sql`

Creates the shared `reviews` table so customers see each other's reviews.

---

## 3. `SOLAR_PLANS_SETUP.sql`

Creates `solar_plans` and adds the columns the admin writes (price, capacity,
best_for, can_power, backup_time, notes, is_active).

---

## 4. `SECURITY_HARDENING.sql`  ← new

- `increment_product_rating()` — atomic rating, replaces the browser-side
  average that was forgeable and racy
- `increment_review_helpful()` — the function the Helpful button already called
  but which did not exist, so it silently failed on every click
- Reviews: length and rating `CHECK` constraints, and an insert policy that
  forces `is_verified = false` and `helpful_count = 0` so nobody can award
  themselves a verified badge
- `products` and `solar_plans`: read-only to visitors, writes require an
  authenticated admin

---

## 5. `STORAGE_SETUP.sql`  ← new

Creates the `product-images` and `solar-plan-images` buckets (5 MB, image types
only). Public read, admin-only upload/update/delete. Images stop being stored as
base64 inside table rows.

Existing rows that already contain a base64 data URL keep rendering. Re-upload an
image to migrate that row to a real URL.

---

## 6. Server environment variables (Vercel dashboard)

Set these in **Vercel → Settings → Environment Variables**. Do **not** put them in
a `.env` file and do **not** prefix them with `VITE_`.

| Variable | Secret? | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | no | Project URL, used by the functions |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | Bypasses RLS; server only |
| `PAYSTACK_SECRET_KEY` | **yes** | Can move real money; server only |
| `SITE_URL` | no | `https://cedokamall.com`, used for the same-origin check |

Apply to Production, Preview and Development as appropriate, then redeploy.

Anything named `VITE_*` is compiled into the browser bundle and is public. That
includes the Supabase anon key, which is designed to be public — your data is
protected by the RLS policies in step 4, not by hiding the key.

---

## Verifying it worked

**Payments:** `POST /api/checkout/initialize` with an empty body should return
`500 {"error":"Payments are not configured on this deployment yet."}` when the
secrets are absent, and a real `authorizationUrl` once they are present. That
error is deliberate and safe to show.

**Storage:** upload an image in the admin. If the bucket policies are missing the
admin falls back to an inline image and logs `Falling back to an inline image:`
in the console — the plan still saves either way.

**Ratings:** rate a product. The network tab should show an `rpc`
call to `increment_product_rating` rather than a `PATCH` to `products`.

---

## Still outstanding

- Report scoping per business/branch (schema not yet designed)
- Serial-number tracking for unique sale items
- A real moderation path for reviews, currently deliberately closed to the public
