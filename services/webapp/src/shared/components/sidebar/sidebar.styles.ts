import styled from 'styled-components';
import { ComponentProps } from 'react';
import { Link } from '../link';
import { ButtonVariant } from '../button/button.types';
import { sizeUnits } from '../../../theme/size';
import { labelBold } from '../../../theme/typography';
import { greyScale, skyBlueScale } from '../../../theme/color';
import { color } from '../../../theme';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.div`
  position: absolute;
  height: 100vh;
  display: flex;
  width: 281px;
  flex-direction: column;
  background-color: ${greyScale.get(99)};

  ${media(Breakpoint.TABLET)`
    position: relative;
    height: auto;
  `};
`;

export const MenuLink = styled(Link).attrs(() => ({ variant: ButtonVariant.FLAT, navLink: true }))<
  ComponentProps<typeof Link>
>`
  height: ${sizeUnits(6)}px;
  padding-left: ${sizeUnits(5)}px;
  ${labelBold};
  background-color: ${greyScale.get(99)};

  &.active {
    background-color: ${skyBlueScale.get(50)};

    &:not(:focus):not(:hover):not(:active) {
      color: ${color.white};
    }
  }
`;
