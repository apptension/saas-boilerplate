import styled, { css } from 'styled-components';

import { fontFamily, fontWeight } from '../../theme';
import { Image } from './image';

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

export const Tr = styled.tr``;

export const Td = styled.td``;

export const Icon = styled(Image)`
  width: 20px;
`;

export const injectedFonts = css`
  @font-face {
    font-family: ${fontFamily.primary};
    src: url('${process.env.PUBLIC_BUCKET_URL ?? ''}/email-assets/Inter-Regular.woff') format('woff');
    font-weight: ${fontWeight.regular};
    font-style: normal;
  }

  @font-face {
    font-family: ${fontFamily.primary};
    src: url('${process.env.PUBLIC_BUCKET_URL ?? ''}/email-assets/Inter-SemiBold.woff') format('woff');
    font-weight: ${fontWeight.bold};
    font-style: normal;
  }
`;
