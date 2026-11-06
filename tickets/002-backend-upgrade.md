# 002 — Upgrade API and fix query safety

Status: Complete (2026-11-06)

## Prerequisites

- Ticket 001 baseline and audit findings.
- Current migration guides for NestJS, Apollo Server, Mongoose, and their peer dependencies.

## Work

- Pin Node.js 24 and upgrade NestJS, Apollo integration, Mongoose, GraphQL, TypeScript, lint/test tooling, and lockfile in compatible groups. Remove obsolete packages.
- Preserve `/graphql` schema and response shape. Verify CORS can accept the production frontend and a temporary exact Pages preview origin.
- Escape user input before constructing search regexes; bound input length and validate `SEARCH_LIMIT`. Keep normal search semantics.
- Add a small health endpoint that verifies the API and database are usable. Check production start command, GraphQL schema loading, and Railway `PORT` binding.
- Run build, tests, audit, and representative GraphQL queries against an isolated database.

## Acceptance criteria

- Node 24 clean install and production build work; API starts under its production command.
- Existing empty and named search queries return expected shapes. Regex metacharacters are treated as text, and pathological input is bounded.
- Health check and CORS work for intended origins. No new critical/high audit finding remains without a documented decision.

## Implementation notes

- Upgraded `backend/.nvmrc`, `backend/package.json`, and lockfile to tested Node 24.21.0/npm 11, Nest 12, Apollo Server 5, GraphQL 16, Mongoose 9, TypeScript 6, ESLint 10, and current matching tooling. Removed Apollo Server 3, Jest, obsolete e2e fixtures, unused packages, and the old ESLint config. Node 24's built-in test runner replaces Jest because Jest failed to load Nest 12's ESM packages in this CommonJS app.
- `backend/src/modules/protocol/protocol.service.ts` now escapes search text before regex construction, limits queries to 100 characters, and requires `SEARCH_LIMIT` to be an integer from 1 to 100. Empty search and exact symbol matching remain intact. `backend/src/main.ts` binds Railway's `PORT` on `0.0.0.0` and allows only `FRONTEND_URL` plus optional exact `FRONTEND_PREVIEW_URL` through CORS. `backend/src/app.controller.ts` adds `GET /health` with a MongoDB ping; unavailable MongoDB returns 503.
- `backend/nest-cli.json` copies the GraphQL SDL into `dist`, and `AppModule` loads it relative to the compiled module. Removed runtime type generation and aliased imports so `node dist/main.js` works from the backend directory. Type generation remains available through `npm run generate:typings`. Updated `backend/README.md` with local commands and environment variables.
- Verified on Node 24.21.0/npm 11.19.0: `npm ci`, `npm run build`, `npm test` (4 passed), `npm run lint`, and `npm run generate:typings`. `npm run test:integration` passed against isolated local MongoDB 7.0.7 at `127.0.0.1/defibar`: compiled production command, empty/named/literal GraphQL queries, health, and production/preview CORS. It inserted two temporary documents and removed them. Repeated the integration check after `npm ci --omit=dev`; it passed with production-only dependencies. No deployment or production data access.
- `npm audit` reports 15 moderate findings overall, 5 with `--omit=dev`, and no high or critical findings. The remaining moderate findings arise from the current `minimatch` advisory (`GHSA-g3hv-75wg-m249`) in Nest GraphQL's optional `ts-morph` chain and build/lint tooling. npm suggests downgrading incompatible Nest/GraphQL majors; the API never passes user input to `minimatch`. Recheck when upstream packages update. The legacy updater is still pending ticket 003 and was not run or changed here.
