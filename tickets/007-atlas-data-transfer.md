# 007 — Freeze and transfer Atlas data

Status: Complete

## Prerequisites

- Tickets 005 and 006 have working destinations.
- Authorized Atlas dump access, Railway private restore path, and a scheduled maintenance window.
- Backup/restore procedure rehearsed on disposable data.

## Work

- Record frozen source count and recent updater status. Disable the AWS EventBridge rule and wait for active Lambda execution to finish.
- Keep Atlas intact for rollback and retain a private BSON dump of the production `test` database with MongoDB Database Tools. Replace the disposable Railway `defibar.protocols` rehearsal data during restore (for example, with `mongorestore --drop`), retaining Atlas `protocols` documents, `_id` values, and index metadata. Use Railway CLI's private SSH database tunnel, keeping the MongoDB TCP proxy disabled. Avoid credentials in shell history/logs; `railway connect --tunnel-only` prints the password to its terminal.
- Compare source and destination counts, indexes, representative documents, and API search results. Confirm target DB URI selects `defibar`.
- Keep the AWS rule disabled and Atlas unchanged until cutover decision.

## Acceptance criteria

- Railway `defibar.protocols` matches the frozen Atlas `test.protocols` count and expected records; no restore failures.
- API searches on Railway return expected results from transferred data.
- Atlas dump location and exact rollback baseline are recorded in implementation notes without exposing credentials or data publicly.

## Preflight findings

Native MongoDB Database Tools 100.18.0 for macOS arm64 were installed under `/private/tmp/defibar-mongo-tools/mongodb-database-tools-macos-arm64-100.18.0/bin`; this is temporary local state and may need reinstalling in a later session. The production Heroku `DATABASE_URL` was used in memory for an authenticated, read-only Atlas check on 2026-11-06: `test.protocols` had 8,943 documents and `protocols` was the only collection in `test`. The URI has `/` rather than an explicit database path, so **always pass `--db test` to `mongodump`** and map it to `defibar` on restore. No Atlas data or AWS schedule was changed during this preflight.

A private Railway BSON restore rehearsal on 2026-11-06 dumped all 8,950 disposable `defibar.protocols` records, restored them into a separate `defibar_restore_rehearsal` database, and matched count, a representative document, and indexes. The rehearsal database was dropped afterward. The CLI tunnel was used without a public MongoDB TCP proxy.

## Implementation notes

- At about 01:55 UTC on 2026-11-06, verified that EventBridge rule `make-db-lambda-production-CronHandlerEventsRuleSch-1PIOHY7RYS8CG` still targeted the expected Lambda, then disabled it. Its state was confirmed `DISABLED`. Atlas `test.protocols` remained at 8,943 documents before and after the freeze and dump. No scheduled Lambda execution was near the 05:00 UTC run.
- Dumped the entire Atlas `test` database (only `protocols`) with MongoDB Database Tools 100.18.0 to a gzip BSON archive. Retained a private copy at `.migration-backups/defibar-atlas-frozen-2026-11-06.archive.gz` (1,075,301 bytes, SHA-256 `858724576fcf49076b2391f32e344be44818c757239841d2121cadcaf1f827a6`). The directory and file have restrictive local permissions and `.gitignore` excludes the directory. The archive contains production data; do not commit or publish it. Atlas remains intact for rollback.
- Used the private Railway SSH tunnel and `mongorestore --drop --stopOnError` with namespace mapping `test.*` → `defibar.*` to replace the 8,950 disposable Railway records. A dry run passed first. Restored 8,943 records. Sorted-document SHA-256 matched Atlas exactly: `0c5d2723e35c8e5280abc44db6ff00f4a180ad0541dc451d02a13904fed574a1`. Both sides have only the `_id_` index. Railway MongoDB still has no public TCP proxy; the local tunnel was closed after verification.
- The read-only smoke check passed using `https://defibar.pages.dev` and `https://api-production-0fffd.up.railway.app`: HTML, CORS, top results, and eight Uniswap results. Browser search for `aave` returned eight expected links. The Railway updater remains unscheduled and must not run until ticket 008. Production DNS still serves Heroku and the AWS rule must stay disabled through cutover.
