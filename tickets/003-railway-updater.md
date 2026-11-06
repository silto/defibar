# 003 — Consolidate and harden the updater

Status: Complete (code and local verification; Railway deployment remains ticket 005)

## Prerequisites

- Tickets 001 and 002.
- An isolated MongoDB database and representative DefiLlama response fixtures.

## Work

- Make `backend/src/scripts/makeProtocolDb.ts` the single maintained updater entry point, runnable from the built backend package as a finite CLI command.
- Check upstream HTTP status, response shape, required fields, safe HTTP(S) destination URLs, and a plausible minimum count before any database write. Prevent an empty or partial feed from deleting current data.
- Add a unique `defiLlamaId` index where appropriate. Keep upserts and cleanup idempotent; use bounded batches if needed for run time. Do not overbuild a sync system.
- Log run counts and failures without leaking connection strings or entire protocol payloads. Exit nonzero on failure; close MongoDB in `finally` so Railway cron can end.
- Prove normal refresh, repeat run, failed upstream request, and empty/partial response against disposable data.

## Acceptance criteria

- Successful run updates data and exits cleanly. Repeating it does not create duplicate protocols.
- Failed or implausible upstream data leaves existing protocols intact and returns a failing process status.
- The scheduled service needs only a private Railway MongoDB reference. Legacy Lambda code remains untouched until retirement.

## Implementation notes

- Changed `backend/src/scripts/makeProtocolDb.ts` to a built CLI entry point, `backend/package.json` and `backend/tsconfig.build.json` to build/run it, and `backend/src/modules/protocol/schemas/protocol.schema.ts` for the unique `defiLlamaId` index and blank URLs. Added `backend/test/updater.test.cjs` and updated `backend/README.md`.
- The CLI uses `DATABASE_URL` only, requires the `/defibar` database, and does not read the legacy `.env` that can point to production Atlas. `npm run update:protocols` runs the compiled script after `npm run build`. It always closes its MongoDB connection and sets a failing process status on errors. No Railway service or deployment identifier exists yet.
- Validation runs before index creation or document writes: successful HTTP response, JSON array, at least 5,000 records, required fields, unique IDs, safe HTTP(S) destination/logo URLs, a feed no more than 10% smaller than the existing collection, and at least 90% ID overlap once the collection has 100 records. The overlap check prevents a same-size but unrelated feed from replacing existing data. Current public DefiLlama feed passed validation without any database call on 2026-11-06. The feed had about 8,950 records, with roughly 3,700 blank destination URLs. Blank destinations remain blank so those protocols and their document IDs are preserved; unsafe nonblank destinations fail the run. The frontend must guard legacy unsafe or empty links separately.
- Valid feeds upsert in batches of 250 and delete only rows not present in the completed feed. The unique index prevents duplicate IDs. Counts are logged without payloads or connection strings. Database failures during a batch stop cleanup, but previously completed batches can remain; a later run reconciles them.
- Verified `npm run build`, `npm run lint`, `npm test`, and `TEST_DATABASE_URL='mongodb://127.0.0.1:27017/defibar?directConnection=true' npm run test:updater`. Tests cover normal and repeated refresh, preserved IDs, unique index, HTTP/JSON failures, empty/short feeds, a large count drop, a same-size wrong-ID feed, malformed records, duplicate IDs, unsafe URLs, unchanged data on rejected feeds, and refusal of the legacy `/test` database. The updater test used and removed only its own temporary local collection. No production database or AWS resource was changed.
- Ran the built CLI end to end once against the previously empty local `defibar.protocols` collection. It exited 0 in about 1.25 seconds with 8,950 added, 0 deleted, and 3,742 blank URLs. Verified one run ID, deleted exactly those 8,950 local rows, and confirmed the final local protocol count is 0. No production database or AWS resource was changed.
