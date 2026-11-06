# DEFIBAR Monorepo

This is the repository for [DEFIBAR](https://defibar.finance): a Next.js frontend, NestJS GraphQL API, and protocol database updater.

The app runs on Cloudflare Pages (frontend) and Railway (GraphQL API, private MongoDB, and protocol updater). See [PLAN.md](PLAN.md) for the migration sequence and [tickets/](tickets/) for work and acceptance criteria. Agents should read [AGENTS.md](AGENTS.md) before making changes.

Migration progress (2026-11-06): `https://defibar.finance` serves Pages and `https://api.defibar.finance` serves Railway. Atlas `test.protocols` was transferred and verified as Railway `defibar.protocols`; private pre-cutover and post-update BSON archives are retained locally under Git-ignored `.migration-backups/`. Railway's 05:00 UTC updater schedule is configured; its first scheduled run is still pending. Heroku and Atlas remain available for rollback, and the AWS updater schedule is disabled.

Local setup and test instructions are in `frontend/README.md`, `backend/README.md`, and `make-db-lambda/README.md`. The Lambda package remains until the Railway updater is proven and AWS is retired.

Run `node scripts/smoke.mjs` for a read-only production frontend/API check. Set `FRONTEND_URL` and `API_URL` to check preview deployments instead.

## Author

**silto** [Github](https://github.com/silto) [Twitter](https://twitter.com/_silto_)
