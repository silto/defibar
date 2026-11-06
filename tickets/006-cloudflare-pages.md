# 006 — Stage Cloudflare Pages

Status: Not started

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
