import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const theme = {
  background: '#141410',
  textDefault: '#ececec',
  gold: '#d4af37',
};

export default theme;
