import type { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import theme, { GlobalStyles } from '../styles/global';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../lib/apolloClient';

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps);

  return (
    <ApolloProvider client={apolloClient}>
      <GlobalStyles />
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default MyApp;
