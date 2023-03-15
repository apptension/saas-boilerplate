import { border, color, media, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  padding: ${size.sizeUnits(2)};
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'date amount'
    'details details'
    'card card';
  grid-row-gap: ${size.sizeUnits(1)};
  grid-column-gap: ${size.sizeUnits(1)};
  border: ${border.light};
  border-radius: 4px;

  ${media.media(media.Breakpoint.TABLET)`
    height: ${size.sizeUnits(8)};
    grid-template-columns: 1fr 1fr 2fr 1fr;
    grid-template-areas: 'date details card amount';
    border-radius: 0;
    align-items: center;
    grid-column-gap: ${size.sizeUnits(10)};
    border: none;
    border-top: 1px solid ${color.greyScale.get(95)};
  `};
`;

export const TransactionDate = styled.div`
  ${typography.labelBold};
  grid-area: date;

  ${media.media(media.Breakpoint.TABLET)`
    ${typography.label};
  `};
`;

export const Details = styled.div`
  ${typography.label};
  grid-area: details;
`;

export const Card = styled.div`
  ${typography.labelBold};
  grid-area: card;

  ${media.media(media.Breakpoint.TABLET)`
    ${typography.label};
  `};
`;

export const Amount = styled.div`
  ${typography.labelBold};
  grid-area: amount;
  text-align: right;

  ${media.media(media.Breakpoint.TABLET)`
    text-align: left;
    ${typography.label};
  `};
`;
