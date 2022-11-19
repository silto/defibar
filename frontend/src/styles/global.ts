import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`

  @font-face {
    font-family: 'Roboto-Slab';
    src: url('/fonts/RobotoSlab-VariableFont_wght.ttf') format('truetype');
    font-weight: 100 900;
    font-display: swap;
  }

  *,
  *::before,
  *::after,
  html {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;

    font-family: 'Roboto-Slab', serif;
    
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  svg {
    pointer-events: none;
  }
`;

const theme = {
  background: '#141410',
  textDefault: '#ececec',
  gold: '#d4af37',
};

export default theme;
