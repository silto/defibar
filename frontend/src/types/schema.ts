import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Protocol = {
  chains?: Maybe<Array<Maybe<Scalars['String']>>>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  logoUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentProtocol?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  symbol?: Maybe<Scalars['String']>;
  tvl?: Maybe<Scalars['Float']>;
  url: Scalars['String'];
};

export type Query = {
  searchProtocol: Array<Protocol>;
};


export type QuerySearchProtocolArgs = {
  query?: InputMaybe<Scalars['String']>;
};

export type SearchProtocolQueryVariables = Exact<{
  query?: InputMaybe<Scalars['String']>;
}>;


export type SearchProtocolQuery = { searchProtocol: Array<{ id: string, name: string, url: string, logoUrl?: string | null, symbol?: string | null, tvl?: number | null }> };


export const SearchProtocolDocument = gql`
    query searchProtocol($query: String) {
  searchProtocol(query: $query) {
    id
    name
    url
    logoUrl
    symbol
    tvl
  }
}
    `;

/**
 * __useSearchProtocolQuery__
 *
 * To run a query within a React component, call `useSearchProtocolQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchProtocolQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchProtocolQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useSearchProtocolQuery(baseOptions?: Apollo.QueryHookOptions<SearchProtocolQuery, SearchProtocolQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchProtocolQuery, SearchProtocolQueryVariables>(SearchProtocolDocument, options);
      }
export function useSearchProtocolLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchProtocolQuery, SearchProtocolQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchProtocolQuery, SearchProtocolQueryVariables>(SearchProtocolDocument, options);
        }
export type SearchProtocolQueryHookResult = ReturnType<typeof useSearchProtocolQuery>;
export type SearchProtocolLazyQueryHookResult = ReturnType<typeof useSearchProtocolLazyQuery>;
export type SearchProtocolQueryResult = Apollo.QueryResult<SearchProtocolQuery, SearchProtocolQueryVariables>;