import { createGlobalStyle } from 'styled-components';

import { fontFamily } from './font';

export const NO_SCROLL_CLASSNAME = 'noScroll';

export const GlobalStyle = createGlobalStyle`
  html {
    font-family: ${fontFamily.primary};
  }
`;
