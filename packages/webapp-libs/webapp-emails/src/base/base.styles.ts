import { ENV } from '@sb/webapp-core/config/env';
import { fontFamily, fontWeight } from '@sb/webapp-core/theme';
import styled, { css } from 'styled-components';

import { darkModeQuery, emailColors, emailFonts, emailLayout, mobileQuery } from '../theme';
import { Image } from './image';

/**
 * Email CSS Reset
 * Normalizes styles across email clients
 */
export const emailReset = css`
  /* Reset margins and padding */
  body,
  table,
  td,
  p,
  a,
  li,
  blockquote {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }

  /* Remove spacing around tables */
  table,
  td {
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }

  /* Reset image borders and spacing */
  img {
    -ms-interpolation-mode: bicubic;
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
  }

  /* Reset body */
  body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }

  /* iOS blue links */
  a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
  }

  /* Gmail blue links */
  u + #body a {
    color: inherit;
    text-decoration: none;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
  }
`;

/**
 * Dark mode styles mixin
 */
export const darkModeStyles = css`
  ${darkModeQuery} {
    background-color: ${emailColors.backgroundDark} !important;
    color: ${emailColors.textDarkMode} !important;
  }
`;

/**
 * Mobile responsive styles mixin
 */
export const mobileStyles = css`
  ${mobileQuery} {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
`;

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  max-width: ${emailLayout.maxWidth};
`;

export const Tr = styled.tr``;

export const Td = styled.td`
  font-family: ${emailFonts.primary};
`;

export const Icon = styled(Image)`
  width: 20px;
`;

/**
 * Font face declarations for custom fonts
 */
export const injectedFonts = css`
  @font-face {
    font-family: ${fontFamily.primary};
    src: url('${ENV.EMAIL_ASSETS_URL}/Inter-Regular.woff') format('woff');
    font-weight: ${fontWeight.regular};
    font-style: normal;
  }

  @font-face {
    font-family: ${fontFamily.primary};
    src: url('${ENV.EMAIL_ASSETS_URL}/Inter-Medium.woff') format('woff');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: ${fontFamily.primary};
    src: url('${ENV.EMAIL_ASSETS_URL}/Inter-SemiBold.woff') format('woff');
    font-weight: ${fontWeight.bold};
    font-style: normal;
  }
`;
