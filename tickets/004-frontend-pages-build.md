# 004 — Upgrade frontend and produce a static export

Status: Complete (local implementation; Pages deployment is ticket 006)

## Prerequisites

- Ticket 001 baseline.
- API URL and GraphQL schema contract from ticket 002.

## Work

- Pin Node.js 24 and upgrade Next.js, React, Apollo Client, styled-components, GraphQL Codegen, TypeScript, lint tooling, and lockfile in compatible groups.
- Preserve the Pages Router and search UI. Replace `@next/font/local` with supported `next/font/local` usage.
- Normalize `frontend/` as the Next project root, including scripts, TypeScript config, public assets, and GraphQL Codegen paths. Add static export output and remove `src/middleware.ts`; Cloudflare serves HTTPS.
- Keep public `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` as build-time variables. Check metadata, fonts, SVGs, favicon, and browser GraphQL calls.
- Run clean install, code generation, build, lint/type checks, audit, and a local static preview search.

## Acceptance criteria

- `frontend/out/` contains a working static site with no required Next server or middleware.
- Search and navigation match baseline behavior on desktop and mobile; assets and social metadata resolve.
- No new critical/high audit finding remains without a documented decision.

## Implementation notes

- **Changed files:** `frontend/package.json` and `package-lock.json` pin Node 24/npm 11, Next.js 16.4.5, React 19.3.1, Apollo Client 4.3.7, styled-components 6.6.0, GraphQL Codegen 7, TypeScript 5.9.3, and current supporting tools. `.nvmrc` pins tested Node 24.21.0. `next.config.js` exports static files and requires both public URL variables. Scripts now run from `frontend/` without a separate `src` project root; webpack remains selected for SVGR imports.
- **Root and assets:** Moved `src/public/*` to `public/*`, including favicon, social images, font, and SVGs. Moved the existing ignored `src/.env.local` to ignored root `.env.local`; no values were logged or committed. Removed duplicate `src/tsconfig.json` and `src/next-env.d.ts`, old HTTPS middleware, and obsolete ESLint config. Added root TypeScript and ESLint configuration, `.env.example`, and updated `frontend/README.md`.
- **GraphQL and UI:** Codegen now reads `src/graphql/searchProtocol.graphql` and emits a typed document in `src/types/schema.ts`. The search page uses Apollo Client 4's React `useQuery`; the browser query and external navigation behavior remain the same. Updated the local font import and styled-components theme types. Replaced timer state and the focus ref dependency to satisfy React 19 lint rules.
- **Verification:** `npm ci --no-audit --no-fund`, `npm run types:generate`, `npm run build`, `npm run lint`, and `npm run typecheck` pass under Node 24.21.0/npm 11.19.0. `out/index.html`, `out/404.html`, the favicon, social images, root font, and generated `_next/static/media/*.ttf` exist. Local static preview on port 4600 with a CORS-enabled mock GraphQL API displayed a Uniswap result and correct external link on desktop and a 390 px mobile viewport; the browser reported no console errors. The real Railway API preview remains for ticket 006.
- **Audit:** Final `npm audit` reports 0 critical, 0 high, 10 moderate, and 3 low findings. `npm audit --omit=dev` reports 0 findings. A scoped lockfile override updates `brace-expansion` under `minimatch@3` to 1.1.21 and clears its high advisory. Remaining findings affect build/lint tools (`minimatch@10` in Codegen/ESLint and `deepmerge` under SVGR among them); forced major transitive changes could break generation or SVG builds, so they remain for a later compatible upstream update. There is no Next server, Cloudflare resource, or deployment identifier yet.
- **Pages settings for ticket 006:** Root directory `frontend/`, build command `npm run build`, output directory `out`; `.nvmrc` supplies Node 24.21.0. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` at build time, including preview-specific values. The build needs the sibling `backend/src/**/*.graphql` schema in the repository checkout. The API must allow each preview origin in CORS.
- **Post-review safety check:** Production Atlas contains 3,660 empty URL strings and 45 other non-HTTP(S) URL strings. The search UI now filters results to absolute HTTP(S) links without credentials or control characters, including the submit path. Ticket 003 also validates new feed URLs before writes. This preserves navigation for valid results and prevents unsafe legacy rows from becoming links.
