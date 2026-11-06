# DEFIBAR Monorepo

This is the repository for [DEFIBAR](https://defibar.finance): a Next.js frontend, NestJS GraphQL API, and protocol database updater.

The app currently runs on Heroku, Atlas, and AWS Lambda. The approved migration moves the frontend to Cloudflare Pages and the API, MongoDB, and daily updater to Railway. See [PLAN.md](PLAN.md) for the sequence and [tickets/](tickets/) for work and acceptance criteria. Agents should read [AGENTS.md](AGENTS.md) before making changes.

Migration progress (2026-11-06): the Railway API at `https://api-production-0fffd.up.railway.app` and Cloudflare Pages preview at `https://defibar.pages.dev/` are healthy. Atlas `test.protocols` was transferred and verified as Railway `defibar.protocols`; a private BSON archive is retained locally. The AWS updater schedule is disabled, and the Railway updater has no schedule yet. Production DNS still points to Heroku, and Atlas remains intact for rollback.

Local setup and test instructions are in `frontend/README.md`, `backend/README.md`, and `make-db-lambda/README.md`. The Lambda package remains until the Railway updater is proven and AWS is retired.

Run `node scripts/smoke.mjs` for a read-only production frontend/API check. Set `FRONTEND_URL` and `API_URL` to check preview deployments instead.

## Author

**silto** [Github](https://github.com/silto) [Twitter](https://twitter.com/_silto_)
