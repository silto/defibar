// Run against production or previews with API_URL and FRONTEND_URL.
const frontendUrl = new URL(process.env.FRONTEND_URL ?? 'https://defibar.finance');
const apiUrl = new URL(process.env.API_URL ?? 'https://api.defibar.finance');
const graphqlUrl = new URL('/graphql', apiUrl);

async function search(query) {
  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: frontendUrl.origin,
    },
    body: JSON.stringify({
      query: 'query Search($query: String) { searchProtocol(query: $query) { id name url } }',
      variables: { query },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`GraphQL HTTP ${response.status}`);
  if (response.headers.get('access-control-allow-origin') !== frontendUrl.origin) {
    throw new Error(`GraphQL CORS does not allow ${frontendUrl.origin}`);
  }
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(`GraphQL returned ${payload.errors.length} error(s)`);
  const results = payload.data?.searchProtocol;
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`GraphQL search returned no results for ${JSON.stringify(query)}`);
  }
  for (const result of results) {
    if (!result.id || !result.name || !/^https?:\/\//.test(result.url)) {
      throw new Error('GraphQL search returned an invalid protocol');
    }
  }
  return results.length;
}

const page = await fetch(frontendUrl, { signal: AbortSignal.timeout(10000) });
if (!page.ok) throw new Error(`Frontend HTTP ${page.status}`);
if (!page.headers.get('content-type')?.includes('text/html')) {
  throw new Error('Frontend did not serve HTML');
}
const html = await page.text();
if (!html.includes('<title>DEFIBAR - The DeFi Search Bar</title>')) {
  throw new Error('Frontend title is missing');
}

const topCount = await search(null);
const namedCount = await search('uniswap');
console.log(`Smoke passed: frontend HTML, CORS, ${topCount} top results, ${namedCount} "uniswap" results.`);
