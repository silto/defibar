# 007 — Freeze and transfer Atlas data

Status: Not started

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
