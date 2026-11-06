# 008 — Cut over API, frontend, and updater

Status: In progress

## Prerequisites

- Tickets 006 and 007 pass. Railway API and Pages preview are healthy.
- AWS updater is disabled; Atlas and Heroku remain available.
- DNS rollback values and responsible operator are recorded.

## Work

- Change `api.defibar.finance` to Railway and verify old Heroku frontend still searches via that hostname.
- Attach/switch `defibar.finance` to Pages. Verify certificate, static assets, search, navigation, errors, and desktop/mobile behavior. Preserve MX/TXT records.
- Run Railway updater once manually against private MongoDB. Verify completion, row counts, and no duplicate data. Enable or confirm its 05:00 UTC schedule, then observe one scheduled run and API health afterward.
- If checks fail before Railway updater writes, reverse DNS and re-enable the AWS rule. After a Railway write, take a fresh private BSON dump and reconcile changes before returning to Atlas.

## Acceptance criteria

- Both public domains serve their intended new hosts and end-to-end search works.
- One manual and one scheduled Railway refresh succeed; AWS rule remains disabled.
- DNS changes, run IDs, validation results, and any rollback action are recorded in implementation notes.

## Cutover observations (scheduled run pending)

- On 2026-11-06, registered Railway API custom domain `api.defibar.finance` (`aaf86027-b719-4357-ac7d-e14d64bc68a5`) and added the ownership TXT record (`3fce36f2fc607426fb0e6771804b97bd`). Changed the existing API CNAME (`8f1888daf3366e1dd108036002674462`) from `philosophical-garbanzo-85mrlu63c7v3f0zdvm4q435l.herokudns.com` to `wsllcm1v.up.railway.app`, retaining DNS-only mode. Railway verified ownership and issued a valid HTTPS certificate. The old Heroku frontend passed search through the new API hostname.
- Rebuilt Cloudflare Pages with `NEXT_PUBLIC_API_URL=https://api.defibar.finance` in production and preview. Deployment `af2ff132-afe3-4a54-805f-a27b0de1c25a` succeeded; the JS bundle embeds that URL. Attached `defibar.finance` to the Pages project (`484c3718-789c-48a2-86a5-802b18dc9dff`) and changed existing apex CNAME (`f74ef92c984288c0bfdae637d6cf9023`) from `lively-chimpanzee-3btdh58px6cr9g6qefx81l7e.herokudns.com` to `defibar.pages.dev`. The domain became active and the apex is proxied as before. During validation, the apex briefly returned 522; switching the CNAME temporarily to DNS-only allowed validation, then proxying was restored. Mail MX/TXT records were preserved.
- Production `https://defibar.finance` and `https://api.defibar.finance` pass HTTPS, CORS, GraphQL search, static asset, and metadata checks. Desktop and 390 px mobile browser searches show results. The read-only smoke check passed after the first Railway update.
- Manual Railway updater deployment `b9b7a9d9-7274-4b01-b5d5-35ba580c8aad` exited successfully: 8,943 matched, 7 added, 0 deleted. The private DB had 8,950 documents and `_id_` plus `defiLlamaId_1` indexes afterward. Set Railway cron to `0 5 * * *` UTC with restart policy `NEVER`. Applying it via deployment `d7bea573-8eed-4077-9718-37e01bcb533c` also exited successfully: 8,950 matched, 0 added/deleted.
- After the first Railway write, saved `.migration-backups/defibar-railway-post-cutover-2026-11-06.archive.gz` (8,950 documents, 1,075,458 bytes, SHA-256 `4afe1a6db81d42fcdaac93c4502f965bf17d69239097a0580dd582882f61c1d4`). It is private and ignored by Git. Atlas remains at the frozen 8,943 records. If rolling back to Atlas now, reconcile/restore the newer Railway snapshot before re-enabling AWS; DNS reversal alone would lose the updates.
- Pending: observe the first scheduled Railway run at or shortly after 05:00 UTC, confirm API health and count, then mark this ticket complete. Heroku, Atlas, and the disabled AWS rule remain available until then. The Pages project has not auto-built documentation-only pushes; verify Git auto-build behavior on a frontend change before switching the production branch.
