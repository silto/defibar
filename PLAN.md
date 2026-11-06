# DEFIBAR migration plan

Updated 2026-11-06. Tickets 001–007 are complete; production cutover in 008 is live, pending the first scheduled Railway run. Cloudflare Pages serves `defibar.finance`, Railway serves `api.defibar.finance` and the private database. The AWS updater is disabled; Heroku and Atlas are retained for rollback. Track implementation in [`tickets/`](tickets/).

## Decisions

- Move the frontend from Heroku to a static Next.js export on Cloudflare Pages at `defibar.finance`.
- Move the NestJS API and MongoDB to one Railway project. Keep MongoDB private to Railway services.
- Move the daily updater from AWS Lambda to a Railway cron service built from `backend/`. Reuse and repair the existing `backend/src/scripts/makeProtocolDb.ts`, then remove the duplicate `make-db-lambda/` package after cutover. Skip the Serverless Framework upgrade.
- Preserve the 05:00 UTC daily schedule (`0 5 * * *`). Railway cron expects the process to exit and can start a few minutes late; a still-running execution causes the next run to be skipped. [Railway cron docs](https://docs.railway.com/cron-jobs).
- Rename the application database from Atlas `test` to Railway `defibar` during restore. The user confirmed `test.protocols` is the production source. Preserve `protocols`, document IDs, and other data.
- Use Node.js 24 LTS for the maintained frontend and backend. Pin a tested patch line in local development and both build environments.
- A short maintenance window is acceptable. Prefer a frozen source, one final dump/restore, and explicit rollback over dual writes.
- Keep the safety pass focused: cover actual failure modes and upgrade regressions without adding unnecessary infrastructure or tests.

## Verified starting point

| Component | Finding |
| --- | --- |
| Frontend | Next.js 13 Pages Router, React 18, Node 16/npm 8 engine; one browser-driven GraphQL page. `frontend/src/middleware.ts` redirects HTTP to HTTPS, which will not run in a static export. |
| API | NestJS 9, Apollo Server 3, Mongoose 6, Node 16; `api.defibar.finance` points to Heroku. `DATABASE_URL` and `FRONTEND_URL` control MongoDB and CORS. |
| Updater | `make-db-lambda/` and `backend/src/scripts/makeProtocolDb.ts` duplicate the refresh logic. Both can delete all rows after an empty upstream response. The backend script does not close its database connection. |
| AWS | The `defibar` AWS CLI profile works when network access is permitted. Lambda `make-db-lambda-production-cronHandler` is active on Node 16, last deployed 2023-04-04. Its EventBridge rule is **enabled** at 05:00 UTC and targets the function. CloudWatch showed one invocation each day in the checked 30-day period, zero Lambda errors, and a successful 2026-11-05 run: 8,927 matched, 16 added, 0 deleted. Serverless dashboard visibility does not reflect the underlying AWS runs. |
| Atlas | Project `Production`, cluster `defibar`, MongoDB 8.0.37 in US East. `test.protocols` contained 8,943 documents, about 4.2 MB of data, and only the `_id` index when inspected. No missing or duplicate `defiLlamaId` values were found. |
| Heroku | `defibar-front` (`7ee2c278-ea68-46ac-9b22-9a96fc8af909`) serves `defibar.finance`; `defibar-backend` (`904405d0-7c51-4a58-9976-ad552da48cb6`) serves `api.defibar.finance`. Each runs one Basic web dyno on `heroku-22` in the US region. Both use a subdirectory buildpack followed by `heroku/nodejs`. Ticket 001 records their config variable names and rollback DNS targets. |
| Destinations | The Railway project and the Git-connected Cloudflare Pages project are staged and healthy. Production apex and `api` still point to Heroku. |

The repository has no current dependency audit or release checks. The frontend build uses `next ... ./src`, with static assets under `src/public`; normalize the project root before configuring Pages. The API search uses an unescaped regular expression from user input. The existing Lambda catches errors without failing the invocation, so its zero-error metric alone does not prove every run succeeded.

## Delivery order

1. **Baseline and audit** — [001](tickets/001-baseline-and-audit.md). Save production behavior and inventory direct/transitive dependency findings. Add only checks that protect the migration.
2. **Upgrade backend** — [002](tickets/002-backend-upgrade.md). Move to Node 24 and compatible NestJS, Apollo, Mongoose, TypeScript, and tooling. Keep `/graphql` behavior; fix query handling and add a useful health check.
3. **Consolidate updater** — [003](tickets/003-railway-updater.md). Make the backend script a safe, finite CLI command. Reject failed/empty/incomplete upstream data before writes or cleanup; use bounded work and proper exit status; close MongoDB. Preserve existing data fields and daily behavior.
4. **Upgrade frontend and export** — [004](tickets/004-frontend-pages-build.md). Upgrade Next.js and peers, normalize the root, remove middleware, and produce a tested `out/` static export.
5. **Provision Railway** — [005](tickets/005-railway-services.md). Create a dedicated project with private MongoDB, API, and cron service. Configure volume, variables, health check, logs, and schedule. Test cron before final data transfer; do not arm its production schedule until final cutover. Railway managed backups require a Pro upgrade that the user declined.
6. **Prepare Pages** — [006](tickets/006-cloudflare-pages.md). Connect the monorepo `frontend/` to Pages, set build variables, and verify a preview against Railway. Allow the exact preview origin temporarily in API CORS.
7. **Final database transfer** — [007](tickets/007-atlas-data-transfer.md). Freeze the AWS updater, retain a private Atlas BSON dump, restore `test.protocols` to Railway `defibar.protocols`, and compare data and queries.
8. **Cut over** — [008](tickets/008-cutover-and-rollback.md). Point `api.defibar.finance` to Railway, then attach/switch `defibar.finance` to Pages. Validate search before enabling Railway cron. Watch a manual run and one scheduled run; keep Heroku and Atlas ready for rollback.
9. **Retire old hosting** — [009](tickets/009-retire-and-document.md). Disable/remove AWS Lambda and its schedule, remove Heroku and Atlas only after acceptance, rotate obsolete credentials, and update README, AGENTS, and runbooks.

## Cutover and rollback rules

- The only known production writer is the updater. Disable the **AWS EventBridge rule** and wait for any running Lambda before the final dump. Verify the frozen count. Do not run the Railway cron during import.
- Use MongoDB Database Tools to transfer BSON plus metadata. Map `test.*` to `defibar.*` on restore, and set Railway API/cron connection strings to `/defibar`. Confirm version compatibility and use a private Railway connection for services. Atlas MCP can inspect data but cannot produce the BSON dump; obtain an authorized Atlas dump connection at execution time. [MongoDB dump/restore guidance](https://www.mongodb.com/docs/database-tools/mongorestore/mongorestore-examples/).
- Compare frozen source and target counts, indexes, representative documents, and GraphQL search results. The 8,943 count is a 2026-11-06 baseline, not the final acceptance count.
- Change the API DNS first: the old frontend can continue using `api.defibar.finance`. Switch the apex to Pages second. Preserve mail MX/TXT and unrelated DNS records.
- Before Railway cron writes, rollback means restoring both DNS records to Heroku and re-enabling the AWS rule against unchanged Atlas. Railway has now written after cutover. A fresh private Railway BSON dump is in `.migration-backups/`; restore/reconcile it to Atlas before re-enabling AWS if rolling back. Railway managed backups remain disabled by user choice; the protocol dataset can also be rebuilt by the updater.
- Do not delete Atlas, Heroku, or AWS resources until production checks and one scheduled Railway run pass.

## Checks still needed during implementation

- Package upgrades and dependency audits are recorded in tickets 002 and 004. Recheck before any later version bump.
- Railway MongoDB 8.0 is provisioned privately in US East with a 1 GB volume; an authenticated SSH tunnel and API search passed. Complete the final manual BSON transfer in ticket 007. The user declined the Pro upgrade required for managed backups.
- The frozen Atlas dump is retained privately in `.migration-backups/` (ignored by Git); ticket 007 records its checksum and restore comparison. Do not put credentials or the archive in Git, logs, or shell history.
- Pages static export and browser search passed at `https://defibar.pages.dev/` against the Railway API. The build uses a temporary Railway API URL; switch to `https://api.defibar.finance` and rebuild at cutover. [Cloudflare Pages guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/); [Next static export guide](https://nextjs.org/docs/pages/guides/static-exports).

## Ticket maintenance

Each ticket states prerequisites, work, and acceptance criteria. Mark status as work proceeds. After implementation, append an `Implementation notes` block with changed files, checks and results, deployment identifiers, and any new gotchas. Update this plan, `README.md`, and `AGENTS.md` when architecture, instructions, or operating steps change.
