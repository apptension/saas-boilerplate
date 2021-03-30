import styled from 'styled-components';
import { heading3 } from '../../../theme/typography';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../../theme/size';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.div`
  ${horizontalPadding(sizeUnits(2))};
  ${verticalPadding(sizeUnits(2))};

  ${media(Breakpoint.TABLET)`
    ${horizontalPadding(sizeUnits(5))};
  `};
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(2)};
`;
