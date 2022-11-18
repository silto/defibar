import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import styled from 'styled-components';
import { gql } from '@apollo/client';

import SearchInput from '@/components/searchInput';
import DEFIBAR from '@/public/DEFIBAR_title.svg';

import { useSearchProtocolLazyQuery } from '@/types/schema';
const Container = styled.div`
  background-color: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100vh;
  justify-content: center;
  align-items: center;
`;

const Title = styled.div`
  max-width: 800px;
  width: 100%;
`;

const InputContainer = styled.div``;

const SEARCH_PROTOCOL_QUERY = gql`
  query searchProtocol($query: String) {
    searchProtocol(query: $query) {
      id
      name
      url
      symbol
      tvl
    }
  }
`;

export const Search: NextPage = () => {
  const [query, setQuery] = useState('');

  const [searchProtocol, { loading: searchLoading, error: searchError, data: searchData }] = useSearchProtocolLazyQuery(
    {
      query: SEARCH_PROTOCOL_QUERY,
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const res = await searchProtocol({ variables: { query } });
      // console.log(res?.data?.searchProtocol);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);
  useEffect(() => {
    searchProtocol({ variables: { query } });
  }, []);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
  };
  console.log(searchData?.searchProtocol);
  return (
    <div>
      <Container>
        <Title>
          <DEFIBAR />
        </Title>
        <InputContainer>
          <SearchInput placeholder="Search" onChange={changeHandler} />
        </InputContainer>
      </Container>
    </div>
  );
};
