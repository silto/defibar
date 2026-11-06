# 005 — Provision and test Railway services

Status: Complete

## Prerequisites

- Tickets 002 and 003 are locally verified.
- Railway account access and selected project/region/cost settings.

## Work

- Create a dedicated DEFIBAR Railway project with MongoDB and a persistent volume. Confirm target MongoDB version, capacity, alerts, and manual restore path before import. The user declined Railway Pro and managed backups because this dataset can be rebuilt.
- Deploy API and cron as separate services from `backend/`. Use Node 24 and private MongoDB variable references pointing to the target `defibar` database. Set API build/start commands and health check.
- Configure the cron service's start command and rehearse `0 5 * * *` UTC in an isolated environment. Do not arm the production schedule or allow a production run until final data transfer and cutover. Verify run logs and process exit in isolation.
- Load a disposable Atlas snapshot or sample data to test Railway API search and updater behavior. Do not run the new cron against Atlas or the final production collection.
- Keep MongoDB without a public TCP proxy. Use an authorized temporary access method for the eventual restore.
- Install and authenticate the Railway CLI before transfer; `railway connect <MongoDB service> --tunnel-only` can expose a local SSH tunnel for `mongorestore` without enabling a public TCP proxy. Verify the actual service name and tunnel command after provisioning.

## Acceptance criteria

- API can reach private MongoDB and passes health/search checks on a Railway test domain.
- Cron can run to completion, exit, and report failures; no production scheduled write occurs yet.
- Manual dump/restore method and the decision to omit managed backups are documented; database has no public endpoint.

## Preflight findings

On 2026-11-06, Railway access showed one personal workspace, `silto's Projects` (`847ebe70-945a-46c6-be28-a2aed5a5f160`), with only the unrelated `tickers` project. There was no DEFIBAR project. The Railway CLI was not installed locally. Railway's [database docs](https://docs.railway.com/databases) describe MongoDB and private networking. The [CLI connect docs](https://docs.railway.com/cli/connect) document an SSH tunnel for a database without a public proxy. The user chose US East and declined the Pro upgrade required for managed backups.

Created the private Railway `defibar` project on 2026-11-06: project `6268995e-b6aa-41f2-b3cf-833f64b98586`, production environment `5a69a7ec-3be0-4ad7-a1b1-92a1877c7a1d`. The code is pushed to `codex/defibar-migration` on `silto/defibar`; remote `master` remains unchanged.

## Implementation notes

- Provisioned `MongoDB` (`3965f47f-dda9-45e1-8c09-beb7a15887a5`) from `mongo:8.0`, one replica in Railway US East `us-east4-eqdc4a`, with a 1 GB persistent volume mounted at `/data/db`. Auth is enabled. Railway reports it online with no public domain or TCP proxy. The `defibar` database currently contains **disposable rehearsal data**; ticket 007 must replace it with Atlas `test.protocols`.
- Provisioned `api` (`722d0b1c-774d-4f2f-b973-c0d15aee8f30`) from `silto/defibar` branch `codex/defibar-migration`, root `backend`, build `npm run build`, start `npm run start:prod`, health `/health`, one US East replica. `DATABASE_URL` uses Railway references to the private MongoDB host and credentials and selects `/defibar?authSource=admin`. `FRONTEND_URL` allows `https://defibar.finance`; ticket 006 must add the exact Pages preview origin. Test domain: `https://api-production-0fffd.up.railway.app`. Railway omitted the branch in the API's saved source config despite deploying the correct branch commit, so the API was pinned to `4f414b60280a0750e7bf7de06e838374da18662d` as well. Update that pin deliberately before deploying later code.
- Provisioned `protocol-updater` (`322a1282-ba0e-46d8-bc89-0780ff0bb7dc`) with the same root/build and `npm run update:protocols` start command. Its restart policy is Never, **cron schedule is unset**, and the Git source is pinned to `4f414b60280a0750e7bf7de06e838374da18662d` so later branch pushes cannot rerun it before cutover. The first run inserted 8,950 feed records, including 3,742 blank URLs, and exited successfully. The second run matched all 8,950, added/deleted zero, and exited. API search returned Uniswap results and the smoke script passed against the Railway API and current Heroku frontend.
- Installed Railway CLI 5.71.0 under `/private/tmp/defibar-railway-cli`, authenticated it, and registered an already loaded public SSH key. `railway connect MongoDB --project 6268995e-b6aa-41f2-b3cf-833f64b98586 --environment production --tunnel-only --port 27018` opened a localhost tunnel. An authenticated, read-only count through that tunnel returned 8,950 records; it was then closed. **The CLI prints the MongoDB password** when opening the tunnel, so suppress its output in agent logs and never copy it to files. The local `atlas` Docker container has `mongodump`, `mongorestore`, and `mongosh`; ticket 007 must arrange a host-accessible restore client through the tunnel.
- The user declined Railway Pro and managed backups. Keep Atlas intact and retain a private BSON dump for transfer and rollback; the data can be rebuilt from the updater feed. The user explicitly authorized a coordinated MongoDB root password rotation after the tunnel CLI displayed the original credential. The password was rotated and verified through the private tunnel, Railway variables were updated without logging the new value, and the API was redeployed. The smoke script passed again afterward. The pinned updater was redeployed to pick up the new credential; it matched all 8,950 records, added/deleted zero, and exited. No password is stored in this repository.
- The final pinned API deployment passed `/health` and the read-only smoke script (frontend HTML, CORS, 10 top results, eight Uniswap results). Production Heroku, Atlas, AWS Lambda, and DNS were not changed in this ticket. Do not enable the updater schedule or run it against final restored data until ticket 008.
