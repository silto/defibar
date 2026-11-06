import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { useQuery } from '@apollo/client/react';
// import Image from 'next/image';
import SearchInput from '@/components/searchInput';
import Info from '@/components/info';
import DEFIBAR from '../../../../public/DEFIBAR_title.svg';
// import borderImage from '../../../../public/border-image.svg';
import { SearchProtocolDocument } from '@/types/schema';

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
  InfoContainer,
  ErrorContainer,
} from './Search.style';

function isSafeProtocolUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value) || /[\u0000-\u001f\u007f-\u009f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password;
  } catch {
    return false;
  }
}

export const Search: NextPage = () => {
  const searchInput = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>('');
  const delayDebounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);
  const {
    // loading: searchLoading,
    error: searchError,
    variables: searchVariables,
    data: searchData,
    refetch,
  } = useQuery(SearchProtocolDocument, {
    fetchPolicy: 'network-only',
    variables: {
      query,
    },
    ssr: false,
  });

  const protocols = searchData?.searchProtocol.filter((protocol) => isSafeProtocolUrl(protocol.url));

  // ____________ Handlers ____________
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
    setSelectedProtocol(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedProtocol !== null && protocols) {
      const protocol = protocols[selectedProtocol];
      window.location.href = protocol.url;
      return;
    }
    if (delayDebounce.current) clearTimeout(delayDebounce.current);
    const prevQuery = searchVariables?.query;
    let data;
    if (prevQuery === query && searchData?.searchProtocol) {
      data = searchData;
    } else {
      const res = await refetch({ query });
      data = res?.data;
    }
    const firstNavigableProtocol = data?.searchProtocol.find((protocol) => isSafeProtocolUrl(protocol.url));
    if (firstNavigableProtocol) {
      window.location.href = firstNavigableProtocol.url;
    }
  };

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>): void => {
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
    const timer = setTimeout(() => {
      void refetch({ query });
    }, 400);
    delayDebounce.current = timer;
    return () => {
      clearTimeout(timer);
    };
  }, [query, refetch]);

  useEffect(() => {
    searchInput.current?.focus();
  }, []);

  return (
    <>
      <Head>
        <title>DEFIBAR - The DeFi Search Bar</title>
        <meta name="description" content="Access DeFi apps, Web3 protocols and crypto exchanges quickly." />
        <meta name="apple-mobile-web-app-title" content="DEFIBAR" />
        <meta property="og:title" content="DEFIBAR - The DeFi Search Bar" />
        <meta property="og:description" content="Access DeFi apps, Web3 protocols and crypto exchanges quickly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL} />
        <meta property="og:site_name" content="DEFIBAR" />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/social_image.png`} />
        <meta name="twitter:title" content="DEFIBAR - The DeFi Search Bar" />
        <meta name="twitter:description" content="Access DeFi apps, Web3 protocols and crypto exchanges quickly." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL}/twitter_image.png`} />
      </Head>
      <PageContainer className={RobotoSlab.variable} tabIndex={0} onKeyDown={keyDownHandler}>
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
          {searchError && <ErrorContainer>{'There was an error getting the protocols'}</ErrorContainer>}
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
        <InfoContainer>
          <Info />
        </InfoContainer>
      </PageContainer>
    </>
  );
};
