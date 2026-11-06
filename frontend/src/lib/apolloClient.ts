import { useMemo } from 'react';
import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';

let apolloClient: ApolloClient;

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
});

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: httpLink,
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
