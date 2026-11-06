# DEFIBAR

[DEFIBAR](https://defibar.finance) is a static Next.js search frontend, a NestJS GraphQL API, and a daily DeFi protocol updater. The frontend runs on Cloudflare Pages. Railway hosts the API, a private MongoDB service, and the updater. The API is at [api.defibar.finance](https://api.defibar.finance/graphql).

## Develop and verify

Use Node.js 24.21.0 and npm 11. There is no root npm workspace. Install and run each package from its directory:

```sh
cd backend
npm ci
cp -n .env.example .env
FRONTEND_URL=http://localhost:4600 npm run start:dev
```

The example database URL selects a disposable local `defibar` database. See [backend/README.md](backend/README.md) for tests and updater safety rules. In another terminal, set `NEXT_PUBLIC_API_URL=http://localhost:4500` and `NEXT_PUBLIC_APP_URL=http://localhost:4600` in `.env.local` before starting the frontend:

```sh
cd frontend
npm ci
cp -n .env.example .env.local
npm run dev
```

GraphQL Codegen in `frontend/` reads schema files from `backend/src`, so both directories must be present. See [frontend/README.md](frontend/README.md) for the static build and checks.

Run `node scripts/smoke.mjs` from the repository root for a read-only production check. Set `FRONTEND_URL` and `API_URL` to check a preview instead.

## Deploy

The Cloudflare Pages project `defibar` is connected to `silto/defibar`. It builds from `frontend/` with `npm run build` and publishes `out/`. The build uses Node 24.21.0. Production and preview builds need `NEXT_PUBLIC_API_URL=https://api.defibar.finance` and `NEXT_PUBLIC_APP_URL=https://defibar.finance`. These values are public and embedded at build time. A Git push to the Pages production branch triggers a build; check its deployment result before treating a release as complete. Update the Pages production branch setting if the repository branch changes.

The Railway project `defibar` in US East has `api`, `protocol-updater`, and private `MongoDB` services. Both app services build from `backend/`. The API starts with `npm run start:prod`, uses `/health` for its health check, and needs `DATABASE_URL` pointing to Railway's private `defibar` database. Set `FRONTEND_URL=https://defibar.finance` and `FRONTEND_PREVIEW_URL=https://defibar.pages.dev` for CORS. The updater starts with `npm run update:protocols`, needs the same private database, has restart policy `NEVER`, and runs on cron `0 5 * * *` UTC. Its process must exit for the next scheduled run to start.

Before deploying backend changes, run the checks in [backend/README.md](backend/README.md). The Railway Git sources were pinned to commit SHAs during migration; inspect and deliberately advance each service's source commit when releasing. Changing the API pin should not run the updater. Confirm the intended deployment succeeds, then run the smoke check. Keep database credentials in Railway variables, not in this public repository or shell history.

## Inspect the daily update

In Railway, open `defibar` → `protocol-updater` → Deployments. Check the latest scheduled deployment after 05:00 UTC: status `SUCCESS`, process exit, and a completion log with matched, added, and deleted counts. A successful deployment status alone does not prove the feed was applied; inspect the completion log. Then check `https://api.defibar.finance/health` and run `node scripts/smoke.mjs`. If the job fails, inspect its logs before retrying. A missed day is acceptable for this dataset; avoid repeated manual runs until the feed or database failure is understood.

## Back up or restore MongoDB manually

Railway MongoDB has a 1 GB persistent volume, no public TCP proxy, and no managed backups on the current plan. The protocol collection can be rebuilt by the updater, but a private BSON archive preserves an exact point in time. Install MongoDB Database Tools, `mongosh`, and an authenticated Railway CLI. Link this checkout to the `defibar` project and production environment once; the resulting `.railway/` metadata is Git-ignored. Use a secure terminal; `railway connect --tunnel-only` prints a database password unless output is suppressed. From the repository root, open a tunnel in one terminal and keep it running:

```sh
railway link --project defibar --environment production
railway connect MongoDB --tunnel-only --port 27018 >/dev/null 2>&1
```

In a second terminal, replace `DB_USER` with the MongoDB username shown in Railway variables. With `--username` and no `--password` option, MongoDB Database Tools prompt for the password. Never print the password or put it in a URI, file, or commit. Save archives only in the Git-ignored `.migration-backups/` directory, with restrictive permissions:

```sh
umask 077
mkdir -p .migration-backups
mongodump --host 127.0.0.1 --port 27018 --username DB_USER --authenticationDatabase admin --db defibar --gzip --archive=.migration-backups/defibar-YYYY-MM-DD.archive.gz
shasum -a 256 .migration-backups/defibar-YYYY-MM-DD.archive.gz
```

Record the archive's date, document count, and checksum somewhere private. Keep it outside Git and off public artifact stores. For a restore, first confirm the archive and target database, stop the updater schedule, and save a fresh dump of the current database. Reopen the private tunnel. `--dryRun` checks archive namespace mapping without writing:

```sh
mongorestore --host 127.0.0.1 --port 27018 --username DB_USER --authenticationDatabase admin --gzip --archive=.migration-backups/defibar-YYYY-MM-DD.archive.gz --nsInclude='defibar.*' --dryRun
```

After the dry run, restore during a planned outage with the same command, replacing `--dryRun` with `--drop --stopOnError`. **`--drop` replaces the existing `defibar` collections.** Check the document count and indexes through the tunnel, then run `/health` and the smoke check. Re-enable the daily schedule and close the tunnel afterward:

```sh
mongosh --host 127.0.0.1 --port 27018 --username DB_USER --authenticationDatabase admin --eval 'const p = db.getSiblingDB("defibar").protocols; print(p.countDocuments({})); printjson(p.getIndexes());'
```

For an old Atlas `test` archive, replace `--nsInclude='defibar.*'` with `--nsInclude='test.*' --nsFrom='test.*' --nsTo='defibar.*'` in both restore commands. That archive predates Railway updates; compare it with current data and explicitly accept any lost changes before restoring it.

## Incident checks

- Frontend failure: inspect the latest Cloudflare Pages deployment, build variables, and `defibar.finance` custom domain. Static files cannot receive new environment values without a rebuild.
- API failure: check Railway `api` deployment logs and `/health`, then private MongoDB status and volume. `/health` returns 503 when MongoDB is unavailable.
- Search or CORS failure: run the smoke script with the affected frontend origin. Check `FRONTEND_URL`, `FRONTEND_PREVIEW_URL`, and the Pages build's `NEXT_PUBLIC_API_URL`.
- Updater failure: inspect the latest `protocol-updater` logs, feed validation error, and private database connection. The updater refuses an implausibly small or incomplete feed before deleting records. Use the manual backup procedure before any destructive repair.

## Author

**silto** [Github](https://github.com/silto) [Twitter](https://twitter.com/_silto_)
