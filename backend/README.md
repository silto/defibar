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
npm run lint
```

The integration test accepts only local `127.0.0.1/defibar`, adds two temporary
documents, and removes them afterward. It does not use the production Atlas URL.

Regenerate types from the GraphQL declarations when the SDL changes:

```
npm run generate:typings
```

## Author

**silto** [Github](https://github.com/silto) [Twitter](https://twitter.com/_silto_)
