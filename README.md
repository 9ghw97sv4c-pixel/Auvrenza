# AUVRENZA — Premium Korean Skincare E-Commerce

A full-stack Next.js 14 (App Router) + TypeScript + Supabase + Stripe e-commerce site, built on top of the original AUVRENZA design system (Fraunces + Inter, ivory/beige/gold/charcoal palette, scroll reveals, bento collections grid, before/after slider).

---

## 1. What's included

- Storefront: home, shop (filters by category/brand/skin-type + search + sort), category pages, **brand pages** (`/brand/anua` etc.), product detail pages (gallery, tabs, related products, sticky add-to-cart), cart, wishlist
- **Brand-focused catalogue**: Anua, COSRX, Beauty of Joseon, Isntree + AUVRENZA Lab house brand. Shop-by-Brand section on homepage + dedicated brand filters and pages
- Auth: email/password sign up, login, logout, forgot/reset password, Google OAuth, Apple OAuth — via Supabase Auth
- Cart & wishlist persisted to Supabase (guest carts merge into the account on login)
- Checkout: address + coupon form → Stripe Checkout → webhook confirms payment, decrements stock, clears cart
- Admin dashboard (`/admin`, role-gated): analytics, products CRUD (including image URLs + live thumbnail preview), inventory, orders + status updates, coupons, customers, quick category creation
- Mobile hamburger navigation (the storefront nav collapses below 980px into a slide-down panel)
- Real product/category photography pipeline: paste image URLs in the admin forms and `next/image` renders them on the storefront; leave them empty and the original gradient placeholder shows instead
- SEO/production assets: dynamic favicon, dynamic Open Graph share image, on-brand loading/404/error states
- i18n: English, Korean, Uzbek, Russian — switcher in the header (cookie-based, no URL restructuring)
- Currency switcher: USD / KRW / UZS (static reference rates, see caveats below)
- SEO: per-page metadata, JSON-LD product schema, dynamic sitemap.xml, robots.txt
- Database schema with Row Level Security for every table

---

## 2. Prerequisites

You'll need accounts for:

1. **Supabase** — https://supabase.com (free tier is fine to start)
2. **Stripe** — https://stripe.com
3. **Google Cloud Console** (for Google login) — https://console.cloud.google.com
4. **Apple Developer Program** (for Apple login) — $99/year, required by Apple even for "Sign in with Apple"
5. **Vercel** — https://vercel.com, for deployment

This project's code is complete and wired up, but it **cannot run without your own credentials** for the above — no one can create those accounts on your behalf.

---

## 3. Local setup

```bash
npm install
cp .env.local.example .env.local
# fill in .env.local — see section 4 below
npm run dev
```

Visit `http://localhost:3000`.

---

## 4. Supabase setup

1. Create a new Supabase project.
2. In the SQL editor, paste and run the entire contents of `supabase/schema.sql`. This creates every table, the `is_admin()` helper, and all RLS policies.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this server-side only — it bypasses RLS)
4. Run the seed script to add sample categories/products so the site isn't empty:
   ```bash
   npm run seed
   ```
5. **Create your first admin user**: sign up normally on the site, then in the Supabase SQL editor run:
   ```sql
   update profiles set role = 'admin' where id = '<your-user-uuid>';
   ```
   (Find your UUID in **Authentication → Users**.)

### Enabling Google login
In Supabase: **Authentication → Providers → Google** → enable, and paste the Client ID/Secret from a Google Cloud OAuth consent screen + OAuth client (type "Web application"). Add `https://<your-project>.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud.

### Enabling Apple login
In Supabase: **Authentication → Providers → Apple** → enable, and follow Supabase's Apple setup guide (requires a Services ID, Sign in with Apple key, and your Apple Developer Team ID). This is the most involved provider to configure — budget extra time for it.

---

## 5. Stripe setup

1. Get your API keys from **Developers → API keys**:
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Create a webhook endpoint pointing at `https://<your-domain>/api/webhooks/stripe`, listening for:
   - `checkout.session.completed`
   - `checkout.session.expired`
3. Copy the webhook's **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
4. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Note on currency:** the checkout charges in USD regardless of the storefront's currency switcher — the KRW/UZS switcher is a *display* conversion for browsing. Charging natively in KRW/UZS would require enabling those currencies in your Stripe account and reworking the checkout amount logic; ask if you want that built out.

---

## 6. Environment variables

Copy `.env.local.example` to `.env.local` (local dev) and add the same keys to **Vercel → Project Settings → Environment Variables** for production. `NEXT_PUBLIC_SITE_URL` should be your real deployed URL in production (used in Stripe redirect URLs and the sitemap).

---

## 7. Deploying to Vercel

```bash
vercel
```
or connect the GitHub repo in the Vercel dashboard. Add all env vars from `.env.local.example` before the first deploy. After deploying, update the Stripe webhook URL and Google/Apple OAuth redirect URLs to point at your production domain.

---

## 8. Known limitations / honest caveats

- **Product/category imagery defaults to placeholder gradients** until you add URLs. Paste image URLs into the admin product form (Image URLs field) or the category quick-add form (Image URL field) and the storefront automatically switches to real `next/image` photography — no code changes needed. Any https image host works (Supabase Storage, Cloudinary, your own CDN); there's no file-upload widget, just URL fields, so host the files somewhere first.
- **Currency conversion rates are static**, defined in `src/lib/currency.ts`. For production accuracy, swap in a live FX API.
- **i18n is cookie-based, not URL-based** (no `/ko/shop` style routes) — simpler to ship, but if you want localized URLs for SEO in each language, that's a bigger restructuring (e.g. migrating to `next-intl` with a `[locale]` segment) — ask if you want that.
- **Apple Sign-In requires a paid Apple Developer account** — there's no way around this, it's an Apple requirement, not a code limitation.
- This was built and reviewed carefully, but **has not been run against a live Supabase/Stripe instance** in this environment (no network access here) — run `npm run dev` locally and click through the flows (signup, login, add to cart, checkout with a Stripe test card `4242 4242 4242 4242`) before going live.

---

## 9. Project structure

```
src/
  app/                  → routes (App Router)
    admin/              → role-gated dashboard
    api/                → checkout, stripe webhook, oauth callback, coupon validation
    product/[slug]/     → product detail
    category/[slug]/    → category listing
    shop/                → filtered catalogue
  components/           → UI components (storefront + admin)
  lib/
    supabase/           → browser/server/admin clients
    actions/            → server actions (products, orders, coupons, newsletter, contact)
    i18n/                → dictionaries + locale context
    cart-store.ts        → Zustand cart, synced to Supabase
    wishlist-store.ts    → Zustand wishlist, synced to Supabase
  styles/globals.css     → the original AUVRENZA design system, unchanged
supabase/schema.sql       → full DB schema + RLS
scripts/seed.ts            → sample data
```
