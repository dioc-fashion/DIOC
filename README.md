# DIOC

DIOC is a Next.js storefront for the DIOC fashion brand. The repository also contains the separate Windows desktop administration app under `desktop-admin`.

## Run the website locally

Requirements: Node.js 20 or newer.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Set the public Supabase URL and publishable key in `.env.local` if using customer sign-in or the live catalogue. Keep secret keys out of browser configuration and never commit local environment files.

## Website catalogue publishing

The desktop administration app stores catalogue records locally. Use its **Publishing → Prepare public catalogue** action to update `lib/published-catalog.ts` and `public/catalog-images`. Include those generated public catalogue files in the website deployment to make published products visible in the storefront.

## Validation

```powershell
npm run build
```

## Deploy to Cloudflare Workers

This storefront uses dynamic Next.js rendering, so deploy it as a Worker with OpenNext rather than as a static Cloudflare Pages site.

1. Connect the GitHub repository to **Workers Builds** and select the `main` branch.
2. Set the project root to `/`, build command to `npm run cf:build`, and deploy command to `npx wrangler deploy`.
3. Configure `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as Cloudflare build variables. Set `DIOC_LIVE_CATALOG` to `false` for the published static catalogue, or `true` only after configuring and verifying the Supabase catalogue.
4. Add the production domain in Cloudflare after registration and DNS setup.

`npm run cf:preview` runs the built Worker locally. `npm run cf:deploy` builds and deploys directly from an authenticated local terminal. Never commit `.env.local`, `.dev.vars`, API tokens, or service-role credentials.

See [DEVELOPMENT.md](./DEVELOPMENT.md) for project status and [ADMIN_PORTAL_SETUP.md](./ADMIN_PORTAL_SETUP.md) for desktop administration and catalogue publishing.

## Upload this project to GitHub

After installing Git, run these commands from the project folder. Review `git status` before adding files; `.env.local` and `.dev.vars` are intentionally ignored.

```powershell
git init
git add .
git status
git commit -m "Prepare DIOC storefront for Cloudflare"
git branch -M main
git remote add origin https://github.com/domintolo/DIOC.git
git push -u origin main
```
