import styled from 'styled-components';
import { heading3 } from '../../../theme/typography';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.div`
  ${contentWrapper}
  ${verticalPadding(sizeUnits(4))};
  ${media(Breakpoint.TABLET)`
    ${verticalPadding(sizeUnits(2))};
  `};
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(2)};
`;
