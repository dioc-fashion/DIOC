# DIOC development status

## Completed in this foundation
- Next.js TypeScript storefront with responsive luxury design system.
- Homepage, men/women/kids catalogue filters, product detail pages, persistent client bag and KES totals.
- Shared responsive header, announcement bar, footer and cart drawer mounted once in the app layout.
- Motion for React reveal, stagger, image, header, page transition and scroll progress components, with reduced-motion support.
- Guest wishlist and cart preferences persisted locally.
- Central WhatsApp configuration in `lib/config.ts` using the official DIOC number `+254753672051`.
- Supabase/PostgreSQL starter migration with products, variants, orders, customer data, wishlists, reviews and RLS foundations.
- A standalone Tauri desktop admin using local SQLite, local product-image storage and encrypted backups; customer account sign-in remains optional.
- Basic SEO metadata and accessible labels / navigation.

## Local setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local` and set the available values.
3. Run `npm install` then `npm run dev`.
4. Visit `http://localhost:3000`.
5. See [ADMIN_PORTAL_SETUP.md](./ADMIN_PORTAL_SETUP.md) for the local desktop admin setup, safe product/image migration, and public catalogue requirements.

## Cloudflare Workers
- The storefront requires server-side Next.js rendering. Deploy through Cloudflare Workers using the OpenNext adapter; a static Pages deployment does not support all storefront routes.
- Connect the GitHub repository to Workers Builds with root directory `/`, build command `npm run cf:build`, and deploy command `npx wrangler deploy`.
- Configure `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as build variables in Cloudflare. Do not upload `.env.local` or any privileged Supabase/Cloudflare credentials to GitHub.
- `npm run cf:preview` builds and runs the site in the local Workers runtime. `npm run cf:deploy` requires a Cloudflare-authenticated terminal.

## Local admin and live catalogue
- Manage the business in the Windows desktop app under `desktop-admin`; `/admin` and `admin.dioc.eu.org` now display a migration notice instead of the retired cloud admin.
- The desktop app does not use Supabase. The online storefront can use the manually deployed static catalogue snapshot or Supabase's public catalogue; customer authentication may continue using Supabase.
- With `DIOC_LIVE_CATALOG=false`, the public site serves `lib/published-catalog.ts`; it is empty until populated by the local-export publishing script and deployed. With live mode enabled, the site reads Supabase instead.
- See [ADMIN_PORTAL_SETUP.md](./ADMIN_PORTAL_SETUP.md) for desktop build, safe product/image migration, backup and publishing instructions.

### Supabase connection status
Only optional live-catalogue/customer-account features use the Supabase URL and publishable key. There is no `SUPABASE_SECRET_KEY`, administrator password, or server admin session in the website code.

## Before launch
- Import approved products, photos, stock and prices before enabling the live Supabase catalogue; the storefront does not substitute sample product records.
- The WhatsApp action is an order conversation only; there is no online payment or M-Pesa integration.
- Confirm delivery policy, return policy, support email, physical/business details and legal copy.
- For live Supabase catalogues, apply migrations 001, 002 and 003 in order (or apply only 003 to a database that already has the first two migrations), verify the actual catalogue, then enable live mode. For offline-admin publishing, use the manual snapshot workflow instead.
- Customer account authentication and server-side order creation are still not connected; WhatsApp remains the order conversation flow.
- Add a CAPTCHA/rate limiter to public forms, storage upload policies, sitemap/robots, analytics, and production monitoring.
- Enable the live database catalogue only after confirming the deployed schema and product data.

## Google customer sign-in configuration
The Google OAuth Client ID is recorded in `.env.example` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. It identifies the browser application but cannot authenticate users on its own. To enable sign-in safely:
1. In Google Cloud Console, add the Supabase callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
2. Add your production and local origins to Google OAuth's Authorized JavaScript origins.
3. In Supabase Authentication → Providers → Google, paste the Google Client ID and the matching **client secret** (keep the secret only in Supabase, never in this repository).
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
5. Customer Google sign-in is available from the account page; verify the provider and redirect settings with the configured Supabase project.

## Testing performed
- Desktop frontend production build (`npm run build` in `desktop-admin`).
- Rust backend unit tests (`cargo test`: 3 passed).
- Windows NSIS installer build (`desktop-admin/src-tauri/target/release/bundle/nsis/DIOC Local Administration_0.1.0_x64-setup.exe`).
- Public-site route smoke checks: homepage and `/local-admin` return 200, `/admin` redirects to `/local-admin`, and legacy admin APIs return 410.
- Browser layout smoke checks for the admin save-action row at desktop, tablet and mobile widths.
- Public-site TypeScript checking passes when stale generated types are excluded. The normal root `npx tsc` still sees old `.next/types` references to retired admin routes; do not rebuild or clear the shared `.next` output while the Next.js development server is running.

## UI architecture
- App-wide chrome and the single cart/wishlist provider are composed in `app/layout.tsx`.
- Reusable motion components live in `components/animation/`; global brand and responsive overrides live in `app/premium.css`.
- Tailwind is not installed or used in this project; the existing custom CSS system is retained to avoid introducing an unused styling stack.
