import styled from 'styled-components';
import { ComponentProps } from 'react';
import { heading3 } from '../../../theme/typography';
import { horizontalMargin, horizontalPadding, sizeUnits, verticalPadding } from '../../../theme/size';
import { Breakpoint, media } from '../../../theme/media';
import { Link } from '../../../shared/components/link';
import { greyScale } from '../../../theme/color';

export const Container = styled.div`
  ${verticalPadding(sizeUnits(4))};
  ${media(Breakpoint.TABLET)`
    ${verticalPadding(sizeUnits(2))};
    ${horizontalPadding(sizeUnits(5))};
  `};
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(2)};
  ${horizontalPadding(sizeUnits(2))};

  ${media(Breakpoint.TABLET)`
    ${horizontalPadding('0')};
  `};
`;

export const AddNewLink = styled(Link)<ComponentProps<typeof Link>>`
  width: auto;
  ${horizontalMargin(sizeUnits(2))};

  ${media(Breakpoint.TABLET)`
    ${horizontalMargin('0')};
    position: absolute;
    top: ${sizeUnits(2)};
    right: ${sizeUnits(5)};
  `};
`;

export const List = styled.ul`
  width: 100%;
  margin-top: ${sizeUnits(1)};
  border-radius: 4px;

  ${media(Breakpoint.TABLET)`
    margin-top: ${sizeUnits(2)};
    border: 1px solid ${greyScale.get(95)};
    > li:not(:last-child) {
      border-bottom: 1px solid ${greyScale.get(95)};
    }
  `};
`;
