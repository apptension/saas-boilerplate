import { createGlobalStyle } from 'styled-components';

import { fontFamily } from './font';
import { border } from './index';

export const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    font-family: ${fontFamily.primary};
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  *:focus {
    ${border.outline};
  }
`;
