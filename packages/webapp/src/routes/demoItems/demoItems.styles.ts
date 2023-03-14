import { border, media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.verticalPadding(size.sizeUnits(4))};
  ${media.media(media.Breakpoint.TABLET)`
    ${size.verticalPadding(size.sizeUnits(2))};
    ${size.horizontalPadding(size.sizeUnits(5))};
  `};
`;

export const Header = styled.h1`
  ${typography.heading3};
  margin-bottom: ${size.sizeUnits(1)};
  ${size.horizontalPadding(size.sizeUnits(2))};
`;

export const List = styled.ul`
  width: 100%;
  border-radius: 4px;

  ${media.media(media.Breakpoint.TABLET)`
    border: ${border.light};

    > li:not(:last-child) {
      border-bottom: ${border.light};
    }
  `};
`;
