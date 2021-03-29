import styled from 'styled-components';
import { greyScale } from '../../../../../theme/color';
import { label, labelBold } from '../../../../../theme/typography';
import { sizeUnits } from '../../../../../theme/size';
import { Breakpoint, media } from '../../../../../theme/media';

export const Container = styled.div`
  text-align: left;
  width: 100%;
  max-width: ${sizeUnits(100)};

  ${media(Breakpoint.TABLET)`
    border-radius: 4px;
    border: 1px solid ${greyScale.get(95)};
  `};
`;

export const Entry = styled.div`
  padding: ${sizeUnits(2)};
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'date amount'
    'details details'
    'card card';
  grid-row-gap: ${sizeUnits(1)};
  grid-column-gap: ${sizeUnits(1)};
  border: 1px solid ${greyScale.get(95)};
  border-radius: 4px;

  & + & {
    margin-top: ${sizeUnits(2)};
  }

  ${media(Breakpoint.TABLET)`
    height: ${sizeUnits(8)};
    grid-template-columns: 1fr 1fr 2fr 1fr;
    grid-template-areas: 'date details card amount';
    border-radius: 0;
    align-items: center;
    grid-column-gap: ${sizeUnits(10)};

    & + & {
      margin-top: 0;
      border: none;
      border-top: 1px solid ${greyScale.get(95)};
    }
  `};
`;

export const HeaderRow = styled(Entry)`
  display: none;
  & + & {
    margin-top: ${sizeUnits(2)};
  }
  border-radius: 4px;
  padding: ${sizeUnits(2)};
  grid-template-columns: 1fr 1fr 2fr 1fr;
  grid-template-areas: 'date details card amount';
  border: none;
  background-color: ${greyScale.get(99)};

  ${media(Breakpoint.TABLET)`
    display: grid;
  `};
`;

export const HeaderCell = styled.div`
  ${labelBold};
`;

export const Value = styled.div`
  ${label};
`;

export const TransactionDate = styled(Value)`
  ${labelBold};
  grid-area: date;

  ${media(Breakpoint.TABLET)`
    ${label};
  `};
`;

export const Details = styled(Value)`
  grid-area: details;
`;

export const Card = styled(Value)`
  ${labelBold};
  grid-area: card;

  ${media(Breakpoint.TABLET)`
    ${label};
  `};
`;

export const Amount = styled(Value)`
  ${labelBold};
  grid-area: amount;
  text-align: right;

  ${media(Breakpoint.TABLET)`
    text-align: left;
    ${label};
  `};
`;
