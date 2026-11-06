# DEFIBAR Monorepo

This is the repository for [DEFIBAR](https://defibar.finance): a Next.js frontend, NestJS GraphQL API, and protocol database updater.

The app currently runs on Heroku, Atlas, and AWS Lambda. The approved migration moves the frontend to Cloudflare Pages and the API, MongoDB, and daily updater to Railway. See [PLAN.md](PLAN.md) for the sequence and [tickets/](tickets/) for work and acceptance criteria. Agents should read [AGENTS.md](AGENTS.md) before making changes.

Local setup and test instructions are in `frontend/README.md`, `backend/README.md`, and `make-db-lambda/README.md`. The Lambda package remains until the Railway updater is proven and AWS is retired.

Run `node scripts/smoke.mjs` for a read-only production frontend/API check. Set `FRONTEND_URL` and `API_URL` to check preview deployments instead.

## Author

**silto** [Github](https://github.com/silto) [Twitter](https://twitter.com/_silto_)
