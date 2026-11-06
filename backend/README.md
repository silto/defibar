# DEFIBAR API

This is the backend for [DEFIBAR](https://defibar.finance).

## Tech stack

- NestJS 12, TypeScript 6, Node.js 24
- Apollo Server 5 at `/graphql`
- MongoDB/Mongoose
- ESLint and Prettier

## Local testing

Install dependencies with Node.js 24 and npm 11:

```
npm ci
```

Run with file watch :

```
npm run start:dev
```

Build :

```
npm run build
```

Refresh protocols from the built CLI after setting `DATABASE_URL` to the private
`defibar` database:

```
npm run update:protocols
```

The command fetches DefiLlama once, validates the entire feed, upserts in batches,
removes records absent from a valid feed, logs counts, then closes MongoDB. It exits
nonzero if the feed or database fails. It rejects a feed below 5,000 records,
more than 10% below the current count, or with less than 90% ID overlap when
the current collection has at least 100 records. DefiLlama supplies blank destination URLs
for many records; these remain blank. Nonblank destinations must use HTTP(S) and
must not contain credentials or control characters. The CLI requires an explicit
`DATABASE_URL` selecting `/defibar`; it does not load the old local `.env`.

Start the compiled API as production does:

```
npm run start:prod
```

Set `DATABASE_URL` to an isolated database before local starts. The API listens on
`PORT` (default `4500`) at `0.0.0.0`. `GET /health` pings MongoDB and returns 503
when it is unavailable. Set `FRONTEND_URL` for the production browser origin and
`FRONTEND_PREVIEW_URL` for one exact Cloudflare Pages preview origin. `SEARCH_LIMIT`
defaults to 10 and must be an integer from 1 to 100.

Run unit checks and an isolated HTTP integration check:

```
npm test
TEST_DATABASE_URL='mongodb://127.0.0.1:27017/defibar?directConnection=true' npm run test:integration
TEST_DATABASE_URL='mongodb://127.0.0.1:27017/defibar?directConnection=true' npm run test:updater
npm run lint
```

The integration test accepts only local `127.0.0.1/defibar`, adds two temporary
documents, and removes them afterward. It does not use the production Atlas URL.
The updater test also uses only that local database, in its own temporary collection.

Regenerate types from the GraphQL declarations when the SDL changes:

```
npm run generate:typings
```

## Author

**silto** [Github](https://github.com/silto) [Twitter](https://twitter.com/_silto_)
