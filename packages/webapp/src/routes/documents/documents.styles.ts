import { media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.horizontalPadding(size.sizeUnits(4))};
  ${size.verticalPadding(size.sizeUnits(1))};

  ${media.media(media.Breakpoint.TABLET)`
    ${size.verticalPadding(size.sizeUnits(2))};
    ${size.horizontalPadding(size.sizeUnits(5))};
  `};
`;

export const Header = styled.h1`
  ${typography.heading3};
  margin-bottom: ${size.sizeUnits(1)};
`;

export const List = styled.ul`
  margin-top: ${size.sizeUnits(2)};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-gap: ${size.sizeUnits(3)};
`;
