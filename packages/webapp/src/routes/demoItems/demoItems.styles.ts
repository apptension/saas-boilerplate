import styled from 'styled-components';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../theme/size';
import { heading3 } from '../../theme/typography';
import { Breakpoint, media } from '../../theme/media';
import { border } from '../../theme';

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
    border: ${border.light};

    > li:not(:last-child) {
      border-bottom: ${border.light};
    }
  `};
`;
