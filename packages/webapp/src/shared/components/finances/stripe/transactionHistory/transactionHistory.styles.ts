import { border, color, media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

import { TransactionHistoryEntry } from './transactionHistoryEntry';

export const Container = styled.div`
  text-align: left;
  width: 100%;
  max-width: ${size.sizeUnits(100)};

  ${media.media(media.Breakpoint.TABLET)`
    border-radius: 4px;
    border: ${border.light};
  `};
`;

export const Entry = styled(TransactionHistoryEntry)`
  & + & {
    margin-top: ${size.sizeUnits(2)};
  }

  ${media.media(media.Breakpoint.TABLET)`
    & + & {
      margin-top: 0;
    }
  `};
`;

export const HeaderRow = styled.div`
  display: none;
  padding: ${size.sizeUnits(2)};
  grid-template-columns: 1fr 1fr 2fr 1fr;
  grid-template-areas: 'date details card amount';
  border: none;
  background-color: ${color.greyScale.get(99)};

  grid-row-gap: ${size.sizeUnits(1)};
  grid-column-gap: ${size.sizeUnits(1)};
  border-radius: 4px;

  ${media.media(media.Breakpoint.TABLET)`
    display: grid;
    height: ${size.sizeUnits(8)};
    grid-template-columns: 1fr 1fr 2fr 1fr;
    grid-template-areas: 'date details card amount';
    border-radius: 0;
    align-items: center;
    grid-column-gap: ${size.sizeUnits(10)};
  `};
`;

export const HeaderCell = styled.div`
  ${typography.labelBold};
`;

export const Value = styled.div`
  ${typography.label};
`;
