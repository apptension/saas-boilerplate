import { Link } from '@sb/webapp-core/components/buttons';
import { border, media, size, typography } from '@sb/webapp-core/theme';
import { ComponentProps } from 'react';
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
  margin-bottom: ${size.sizeUnits(2)};
  ${size.horizontalPadding(size.sizeUnits(2))};

  ${media.media(media.Breakpoint.TABLET)`
    ${size.horizontalPadding('0')};
  `};
`;

export const AddNewLink = styled(Link)<ComponentProps<typeof Link>>`
  width: auto;
  ${size.horizontalMargin(size.sizeUnits(2))};

  ${media.media(media.Breakpoint.TABLET)`
    ${size.horizontalMargin('0')};
    position: absolute;
    top: ${size.sizeUnits(2)};
    right: ${size.sizeUnits(5)};
  `};
`;

export const List = styled.ul`
  width: 100%;
  margin-top: ${size.sizeUnits(1)};
  border-radius: 4px;

  ${media.media(media.Breakpoint.TABLET)`
    margin-top: ${size.sizeUnits(2)};
    border: ${border.light};

    > li:not(:last-child) {
      border-bottom: ${border.light};
    }
  `};
`;
