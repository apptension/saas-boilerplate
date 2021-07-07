import styled from 'styled-components';
import { heading3 } from '../../theme/typography';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../theme/size';
import { Breakpoint, media } from '../../theme/media';

export const Container = styled.div`
  ${horizontalPadding(sizeUnits(4))};
  ${verticalPadding(sizeUnits(1))};

  ${media(Breakpoint.TABLET)`
    ${verticalPadding(sizeUnits(2))};
    ${horizontalPadding(sizeUnits(5))};
  `};
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(1)};
`;

export const List = styled.ul`
  margin-top: ${sizeUnits(2)};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-gap: ${sizeUnits(3)};
`;
