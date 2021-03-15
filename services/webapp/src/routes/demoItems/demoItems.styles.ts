import styled from 'styled-components';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../theme/size';
import { heading3 } from '../../theme/typography';
import { Breakpoint, media } from '../../theme/media';
import { greyScale } from '../../theme/color';

export const Container = styled.div`
  ${verticalPadding(sizeUnits(4))};
  ${media(Breakpoint.TABLET)`
    ${verticalPadding(sizeUnits(2))};
    ${horizontalPadding(sizeUnits(5))};
  `};
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(1)};
  ${horizontalPadding(sizeUnits(2))};
`;

export const List = styled.ul`
  width: 100%;
  border-radius: 4px;

  ${media(Breakpoint.TABLET)`
    border: 1px solid ${greyScale.get(95)};
    > li:not(:last-child) {
      border-bottom: 1px solid ${greyScale.get(95)};
    }
  `};
`;
