# 006 — Stage Cloudflare Pages

Status: Complete

## Prerequisites

- Ticket 004 static export passes locally.
- Ticket 005 Railway API test domain works with representative data.

## Work

- Create a DEFIBAR Pages project from this repository with `frontend/` as root, Node 24, `npm run build`, and `out/` output. Set production and preview public URL variables deliberately.
- Add the exact `pages.dev` preview origin to API CORS for testing. Verify HTTPS, browser search, assets, links, and metadata against the Railway API.
- Prepare `defibar.finance` custom domain and DNS cutover details without changing the live apex yet. Preserve mail and unrelated DNS records.

## Acceptance criteria

- Preview build succeeds and a browser can search through Railway API.
- The Pages deployment has a verified custom-domain plan and rollback DNS values.
- Production apex still serves Heroku until ticket 008.

## Preflight findings

The active Cloudflare zone is `defibar.finance` (`ba28189d50085f6ee813ab7a6b462ea7`). Its current apex CNAME record (`f74ef92c984288c0bfdae637d6cf9023`) is proxied to `lively-chimpanzee-3btdh58px6cr9g6qefx81l7e.herokudns.com`; the `api` CNAME (`8f1888daf3366e1dd108036002674462`) is DNS-only to `philosophical-garbanzo-85mrlu63c7v3f0zdvm4q435l.herokudns.com`. Preserve the apex MX/TXT records and unrelated records. Do not attach the Pages custom domain until ticket 008, because that can alter live DNS. The user is creating the Git-connected Pages project in the browser; the Workers setup screen with `wrangler deploy` commands is the wrong flow.

## Implementation notes

- The user created the Git-connected Cloudflare Pages project `defibar` (`835e74ea-8e6a-402a-a444-4a8e14f56f20`) from `silto/defibar`. Its temporary production branch is `codex/defibar-migration`, root `frontend`, build command `npm run build`, and output directory `out`. Preview builds are enabled. No custom domain is attached.
- The first build failed because `NEXT_PUBLIC_API_URL` was absent. Set production and preview variables through the Cloudflare API: `NODE_VERSION=24.21.0`, `NEXT_PUBLIC_API_URL=https://api-production-0fffd.up.railway.app`, and `NEXT_PUBLIC_APP_URL=https://defibar.finance`. Retried deployment `318df714-8586-4d1b-a7b7-d480207daba8` succeeded at `https://defibar.pages.dev/`.
- Added `FRONTEND_PREVIEW_URL=https://defibar.pages.dev` to the Railway API and redeployed it. Updated `scripts/smoke.mjs` to accept the metadata attribute on the Next.js 16 `<title>` element. The smoke check passed with the Pages and Railway URLs: frontend HTML, CORS, top results, and eight Uniswap search results. Browser search on the Pages URL also displayed those eight links. The page title was correct. The apex still points to Heroku.
- At cutover, attach `defibar.finance` to Pages, update the apex DNS, and change the Pages production branch to the final branch after it is merged. Replace the temporary Railway API URL in both Pages deployment environments with `https://api.defibar.finance` and rebuild. Keep the current apex CNAME target and record ID above for rollback. Preserve all mail and unrelated DNS records.
