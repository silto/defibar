import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import styled from 'styled-components';
import { gql } from '@apollo/client';
// import Image from 'next/image';
import SearchInput from '@/components/searchInput';
import DEFIBAR from '@/public/DEFIBAR_title.svg';
// import borderImage from '@/public/border-image.svg';
import { Protocol, useSearchProtocolQuery } from '@/types/schema';

const PageContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100vh;
  justify-content: center;
  align-items: center;
  border: 1px solid;
  border-image-source: url(/border-image.png);
  border-image-slice: 60;
  border-image-width: 30;
  border-image-outset: 0;
  border-image-repeat: repeat;
`;

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 80vh;
  padding: 0 20px 20px;
  top: 20%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-start;
  align-items: center;
`;

const Title = styled.div`
  max-width: 600px;
  max-height: 154px;
  height: 20vh;
  width: 100%;
  margin: 0;
  padding: 0 40px 20px;
  display: flex;
  > svg {
    width: 100%;
    height: auto;
  }
`;

const InputContainer = styled.form`
  width: 100%;
  max-width: 500px;
  height: 50px;
  padding: 0 40px;
  flex-grow: 0;
  flex-shrink: 0;
`;

const ResultsContainer = styled.div`
  margin-top: 30px;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 10px 20px;
  overflow: scroll;
`;

const ProtocolBlock = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  text-decoration: none;
  border: ${({ theme }) => `1px solid ${theme.gold}`};
  /* color: ${({ theme }) => theme.textDefault}; */
  border-radius: 4px;
  /* background: ${({ theme }) => theme.background}; */
  &:hover {
    background: ${({ theme }) => `${theme.gold}30`};
  }
`;
const ProtocolLogo = styled.div<{ imgUrl: string }>`
  background-image: url(${({ imgUrl }) => imgUrl});
  flex-grow: 0;
  width: 25px;
  height: 25px;
  border-radius: 4px;
  background-size: cover;
`;
const ProtocolName = styled.div`
  color: ${({ theme }) => theme.textDefault};
  font-size: 16px;
  font-weight: 400;
`;

const SEARCH_PROTOCOL_QUERY = gql`
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

interface SearchFormElements extends HTMLFormControlsCollection {
  protocolQuery: HTMLInputElement;
}

interface SearchFormElement extends HTMLFormElement {
  readonly elements: SearchFormElements;
}

export const Search: NextPage = () => {
  const searchInput = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [delayDebounce, setDelayDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);
  const {
    loading: searchLoading,
    error: searchError,
    data: searchData,
    refetch,
  } = useSearchProtocolQuery({
    query: SEARCH_PROTOCOL_QUERY,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    delayDebounce && clearTimeout(delayDebounce);
    const delayDebounceFn = setTimeout(() => {
      refetch({ query });
      // console.log(res?.data?.searchProtocol);
    }, 400);
    setDelayDebounce(delayDebounceFn);
    return () => {
      delayDebounce && clearTimeout(delayDebounce);
    };
  }, [query]);

  React.useEffect(() => {
    if (searchInput.current) {
      searchInput.current.focus();
    }
  }, []);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSubmit = async (e: React.FormEvent<SearchFormElement>): Promise<void> => {
    e.preventDefault();
    delayDebounce && clearTimeout(delayDebounce);
    console.log(query);
    const res = await refetch({ query });
    console.log(res?.data?.searchProtocol?.[0]);

    if (res?.data?.searchProtocol && res?.data?.searchProtocol.length > 0) {
      window.location.href = res.data.searchProtocol[0].url;
      // console.log('dest');
      // console.log(res?.data.searchProtocol[0].url);
    }
  };

  // console.log(searchData?.searchProtocol);
  const protocols = searchData?.searchProtocol;
  return (
    <div>
      <PageContainer>
        <Container>
          <Title>
            <DEFIBAR />
          </Title>
          <InputContainer onSubmit={handleSubmit}>
            <SearchInput
              placeholder="Search"
              name="protocolQuery"
              onChange={changeHandler}
              value={query || ''}
              ref={searchInput}
            />
            <input type="submit" hidden />
          </InputContainer>
          <ResultsContainer>
            {protocols &&
              protocols.map((protocol) => (
                <ProtocolBlock key={protocol.id} href={protocol.url}>
                  {protocol.logoUrl && <ProtocolLogo imgUrl={protocol.logoUrl} />}
                  <ProtocolName>{protocol.name}</ProtocolName>
                </ProtocolBlock>
              ))}
          </ResultsContainer>
        </Container>
      </PageContainer>
    </div>
  );
};
