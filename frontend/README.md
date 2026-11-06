# DEFIBAR frontend

Next.js Pages Router frontend, exported as static files for Cloudflare Pages. Browser searches call the GraphQL API directly.

## Local development

Use Node.js 24.21.0 (`.nvmrc`) and npm 11. From `frontend/`:

```sh
npm ci
cp -n .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to the API origin and `NEXT_PUBLIC_APP_URL` to the frontend origin. Both are required and embedded in the browser bundle at build time. The example uses production origins; change them for isolated local or preview testing. The API must allow the frontend origin in CORS.

GraphQL Codegen reads the schema from `../backend/src/**/*.graphql` and the query from `src/graphql/`.

## Static build and checks

```sh
npm run build
npm run lint
npm run typecheck
npm run start-local
```

`npm run build` regenerates GraphQL types and creates `out/`. `start-local` serves those files on port 4600 with Python 3; it does not run a Next.js server. The build uses webpack for SVG imports. Cloudflare Pages supplies HTTPS, so the old redirect middleware is gone.

For Pages, use `frontend/` as the project root, `npm run build` as the build command, and `out` as the output directory. `.nvmrc` pins the build Node version. Set both public URL variables for production and preview builds.
