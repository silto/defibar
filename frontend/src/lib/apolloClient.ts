import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

let apolloClient: ApolloClient<NormalizedCacheObject>;

const httpLink = createHttpLink({
  uri: 'http://localhost:4500/graphql',
});

const authLink = setContext((_: unknown, { headers }: { headers: { [key: string]: string } }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState: NormalizedCacheObject | null = null) {
  const newApolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    newApolloClient.cache.restore(initialState);
  }
  if (typeof window === 'undefined') return newApolloClient;
  if (!apolloClient) apolloClient = newApolloClient;

  return newApolloClient;
}

export function useApollo(initialState: NormalizedCacheObject) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
