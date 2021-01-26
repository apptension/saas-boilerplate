import { createGlobalStyle } from 'styled-components';

import { fontFamily } from './font';

export const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    font-family: ${fontFamily.primary};
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
`;
