import { media, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.contentWrapper}
  ${size.verticalPadding(size.sizeUnits(4))};
  ${media.media(media.Breakpoint.TABLET)`
    ${size.verticalPadding(size.sizeUnits(2))};
  `};
`;

export const Header = styled.h1`
  ${typography.heading3};
`;
