import { media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.horizontalPadding(size.sizeUnits(2))};
  ${size.verticalPadding(size.sizeUnits(2))};

  ${media.media(media.Breakpoint.TABLET)`
    ${size.horizontalPadding(size.sizeUnits(5))};
  `};
`;

export const Header = styled.h1`
  ${typography.heading3};
  margin-bottom: ${size.sizeUnits(2)};
`;
