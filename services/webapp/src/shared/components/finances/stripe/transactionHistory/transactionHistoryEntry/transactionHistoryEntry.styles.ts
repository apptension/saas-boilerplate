import styled from 'styled-components';
import { label, labelBold } from '../../../../../../theme/typography';
import { Breakpoint, media } from '../../../../../../theme/media';
import { sizeUnits } from '../../../../../../theme/size';
import { border, color } from '../../../../../../theme';

export const Container = styled.div`
  padding: ${sizeUnits(2)};
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'date amount'
    'details details'
    'card card';
  grid-row-gap: ${sizeUnits(1)};
  grid-column-gap: ${sizeUnits(1)};
  border: ${border.light};
  border-radius: 4px;

  ${media(Breakpoint.TABLET)`
    height: ${sizeUnits(8)};
    grid-template-columns: 1fr 1fr 2fr 1fr;
    grid-template-areas: 'date details card amount';
    border-radius: 0;
    align-items: center;
    grid-column-gap: ${sizeUnits(10)};
    border: none;
    border-top: 1px solid ${color.greyScale.get(95)};
  `};
`;

export const TransactionDate = styled.div`
  ${labelBold};
  grid-area: date;

  ${media(Breakpoint.TABLET)`
    ${label};
  `};
`;

export const Details = styled.div`
  ${label};
  grid-area: details;
`;

export const Card = styled.div`
  ${labelBold};
  grid-area: card;

  ${media(Breakpoint.TABLET)`
    ${label};
  `};
`;

export const Amount = styled.div`
  ${labelBold};
  grid-area: amount;
  text-align: right;

  ${media(Breakpoint.TABLET)`
    text-align: left;
    ${label};
  `};
`;
