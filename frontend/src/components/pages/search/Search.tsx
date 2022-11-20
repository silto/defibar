import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { gql } from '@apollo/client';
// import Image from 'next/image';
import SearchInput from '@/components/searchInput';
import DEFIBAR from '@/public/DEFIBAR_title.svg';
// import borderImage from '@/public/border-image.svg';
import { useSearchProtocolQuery } from '@/types/schema';

import { RobotoSlab } from '@/lib/fonts';

import {
  PageContainer,
  Container,
  Title,
  InputContainer,
  ResultsContainer,
  ProtocolBlock,
  ProtocolLogo,
  ProtocolName,
} from './Search.style';

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
  const [query, setQuery] = useState<string>('');
  const [delayDebounce, setDelayDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
  const {
    // loading: searchLoading,
    // error: searchError,
    data: searchData,
    refetch,
  } = useSearchProtocolQuery({
    query: SEARCH_PROTOCOL_QUERY,
    fetchPolicy: 'network-only',
  });
  // console.log(searchData?.searchProtocol);
  const protocols = searchData?.searchProtocol;

  // ____________ Handlers ____________
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
    setSelectedProtocol(null);
  };

  const handleSubmit = async (e: React.FormEvent<SearchFormElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedProtocol !== null && protocols) {
      const protocol = protocols[selectedProtocol];
      window.location.href = protocol.url;
      return;
    }
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

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    console.log(e);
    console.log(protocols);

    if (!protocols || protocols.length === 0) {
      return;
    }
    switch (e.key) {
      case 'ArrowUp':
        if (!selectedProtocol) {
          setSelectedProtocol(protocols.length - 1);
          return;
        }
        setSelectedProtocol(selectedProtocol - 1);
        break;
      case 'ArrowDown':
        if (selectedProtocol === null || selectedProtocol === protocols.length - 1) {
          setSelectedProtocol(0);
          return;
        }
        setSelectedProtocol(selectedProtocol + 1);
        break;
      case 'Enter':
        if (selectedProtocol !== null && protocols) {
          const protocol = protocols[selectedProtocol];
          window.location.href = protocol.url;
          return;
        }
    }
  };

  // ____________ useEffect Hooks ____________
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

  useEffect(() => {
    if (searchInput.current) {
      searchInput.current.focus();
    }
    // document.addEventListener('keydown', keyDownHandler);
    // return () => document.removeEventListener('keydown', keyDownHandler);
  }, []);

  return (
    <div className={RobotoSlab.variable}>
      <PageContainer tabIndex={0} onKeyDown={keyDownHandler}>
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
              protocols.map((protocol, index) => (
                <ProtocolBlock
                  key={protocol.id}
                  href={protocol.url}
                  selected={index === selectedProtocol}
                  onFocus={() => setSelectedProtocol(index)}
                  tabIndex={index + 2}
                >
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
