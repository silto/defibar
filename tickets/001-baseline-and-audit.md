# 001 — Baseline and dependency audit

Status: Complete

## Prerequisites

- Read `PLAN.md`, `AGENTS.md`, and current package manifests.
- Read-only access to production API, Atlas, AWS profile `defibar`, and relevant deployment settings.

## Work

- Capture current API search behavior (empty and named query), frontend search flow, updater timing, collection count/indexes, DNS, and environment variable **names**. Do not record secret values.
- Run `npm ci`, builds, existing tests, and dependency audits for all three current packages where supported. Record failures and direct/transitive findings; do not apply broad audit fixes blindly.
- Add a small repeatable smoke check for API search and frontend delivery, verify browser search, and specify the updater safe-failure check for ticket 003.
- Record a pre-migration rollback baseline and identify the AWS rule, DNS targets, Atlas cluster, and Heroku app IDs.

## Acceptance criteria

- Baseline observations and audit results are recorded in this ticket's implementation notes, with commands and dates.
- Repeatable checks distinguish a working frontend/API from broken delivery, CORS, or search. The empty-updater-feed regression is explicit in ticket 003.
- No production mutation or secret disclosure occurred.

## Implementation notes

Completed 2026-11-06. Added `scripts/smoke.mjs`, a dependency-free check for frontend HTML, API CORS, and empty/named GraphQL searches. Run `node scripts/smoke.mjs` against production; set `FRONTEND_URL` and `API_URL` to test preview hosts. The production check passed: 10 top results and 8 `uniswap` results. A browser search displayed eight matching links. Both GraphQL requests returned HTTP 200 with no errors; the frontend returned HTTP 200 and its expected title.

The browser search updates after a short debounce, presents matching protocol links, and uses the selected or first result on submission. The empty query returned 10 top protocols, led by Binance CEX, OKX, and Lido; `uniswap` returned eight, led by Uniswap V3/V4/V2. Environment variable names found in code/examples: frontend `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `DISABLE_HTTPS_REDIRECT`; backend `NODE_ENV`, `DATABASE_URL`, `FRONTEND_URL`, `SEARCH_LIMIT`, `GRAPHQL_PLAYGROUND`, `PORT`; Lambda `DEFIBAR_DATABASE_URL`, `DEFIBAR_DATABASE_URL_SECRET`. No values were recorded.

Atlas MCP confirmed `Production` / `defibar` / `test.protocols`: 8,943 documents, about 4.2 MB, only `_id` index, no missing or duplicate `defiLlamaId`. All documents had one `updateId` at inspection. The active AWS resource is `make-db-lambda-production-cronHandler` in `us-east-1`, targeted by enabled rule `make-db-lambda-production-CronHandlerEventsRuleSch-1PIOHY7RYS8CG` at `cron(0 5 * * ? *)`. CloudWatch showed daily invocations in the checked month, zero Lambda errors, and a successful 2026-11-05 completion. The Lambda catches its own errors, so the metric is not a sufficient success signal by itself.

Cloudflare rollback DNS values: apex `defibar.finance` is a proxied CNAME to `lively-chimpanzee-3btdh58px6cr9g6qefx81l7e.herokudns.com`; `api.defibar.finance` is a DNS-only CNAME to `philosophical-garbanzo-85mrlu63c7v3f0zdvm4q435l.herokudns.com`. Heroku CLI access was restored on 2026-11-06. The frontend app is `defibar-front` (`7ee2c278-ea68-46ac-9b22-9a96fc8af909`), with custom domain `defibar.finance`; the API app is `defibar-backend` (`904405d0-7c51-4a58-9976-ad552da48cb6`), with custom domain `api.defibar.finance`. Both use the `heroku-22` stack in the US region, one running Basic `web` dyno, and the `subdir-heroku-buildpack` plus `heroku/nodejs` buildpacks. The Heroku domain targets match the Cloudflare DNS records above.

Heroku config key inventory (names only): frontend `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `PAPERTRAIL_API_TOKEN`, `PROJECT_PATH`; backend `DATABASE_URL`, `FRONTEND_URL`, `GRAPHQL_PLAYGROUND`, `PAPERTRAIL_API_TOKEN`, `PROJECT_PATH`, `SEARCH_LIMIT`. No values were recorded. `PROJECT_PATH` belongs to the old monorepo Heroku buildpack; Pages and Railway need their own project root settings. Each app has a Papertrail add-on (`papertrail-corrugated-52733` for frontend, `papertrail-slippery-82708` for backend) on the `papertrail:choklad` plan; include these in retirement and billing checks.

Under Node 18.20.8/npm 10.8.2 (Node 16 is not installed locally), `npm ci --no-audit --no-fund` succeeded in all three packages, with expected Node 16 engine warnings. Backend and frontend builds passed. Frontend lint passed with two unused-variable warnings in `Search.tsx`; its current build renders `/` as static HTML but still builds middleware. Backend unit test passed with `npm test -- --runInBand --watchman=false`; the first run failed only because Watchman could not access its state in the sandbox. The existing e2e test was not run: it imports the full app, would use the local production DB URL, and expects an unregistered `Hello World!` controller.

`npm audit --json` on the existing lockfiles reported affected package counts: frontend **81** (5 critical, 61 high, 8 moderate, 7 low; 7 direct), backend **87** (6 critical, 32 high, 35 moderate, 14 low; 15 direct), legacy Lambda **59** (8 critical, 23 high, 25 moderate, 3 low; 2 direct). Direct findings include Next.js, GraphQL Codegen, NestJS, Mongoose, and `serverless-offline`; the rest are transitive. These are baseline counts, not fixes. Tickets 002–004 address the maintained packages; ticket 009 removes the legacy Lambda package.

Updater safe-failure regression for ticket 003: when DefiLlama returns an HTTP error, empty array, invalid rows, or a substantially incomplete list, the process must exit nonzero and leave existing protocols unchanged. The current code does not satisfy this. No production resource or database was mutated in this ticket.
