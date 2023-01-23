import styled from 'styled-components';
import { border, color } from '../../../../../theme';
import { label, labelBold } from '../../../../../theme/typography';
import { sizeUnits } from '../../../../../theme/size';
import { Breakpoint, media } from '../../../../../theme/media';
import { TransactionHistoryEntry } from './transactionHistoryEntry';

export const Container = styled.div`
  text-align: left;
  width: 100%;
  max-width: ${sizeUnits(100)};

  ${media(Breakpoint.TABLET)`
    border-radius: 4px;
    border: ${border.light};
  `};
`;

export const Entry = styled(TransactionHistoryEntry)`
  & + & {
    margin-top: ${sizeUnits(2)};
  }

  ${media(Breakpoint.TABLET)`
    & + & {
      margin-top: 0;
    }
  `};
`;

export const HeaderRow = styled.div`
  display: none;
  padding: ${sizeUnits(2)};
  grid-template-columns: 1fr 1fr 2fr 1fr;
  grid-template-areas: 'date details card amount';
  border: none;
  background-color: ${color.greyScale.get(99)};

  grid-row-gap: ${sizeUnits(1)};
  grid-column-gap: ${sizeUnits(1)};
  border-radius: 4px;

  ${media(Breakpoint.TABLET)`
    display: grid;
    height: ${sizeUnits(8)};
    grid-template-columns: 1fr 1fr 2fr 1fr;
    grid-template-areas: 'date details card amount';
    border-radius: 0;
    align-items: center;
    grid-column-gap: ${sizeUnits(10)};
  `};
`;

export const HeaderCell = styled.div`
  ${labelBold};
`;

export const Value = styled.div`
  ${label};
`;
