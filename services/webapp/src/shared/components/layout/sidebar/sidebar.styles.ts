import styled from 'styled-components';
import { ComponentProps } from 'react';
import { Link } from '../../link';
import { ButtonVariant } from '../../forms/button';
import { sizeUnits } from '../../../../theme/size';
import { labelBold } from '../../../../theme/typography';
import { greyScale, skyBlueScale } from '../../../../theme/color';
import { color, size, transition, zIndex } from '../../../../theme';
import { Breakpoint, media } from '../../../../theme/media';

export const Container = styled.div<{ isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${greyScale.get(99)};
  z-index: ${zIndex.header};

  ${(props) =>
    transition.withVisibility({
      isVisible: props.isOpen,
      duration: '0.2s',
      properties: [
        {
          name: 'transform',
          valueWhenHidden: 'translateX(-101%)',
          valueWhenVisible: 'translateX(0)',
        },
      ],
    })};

  ${media(Breakpoint.TABLET)`
    width: ${size.sideMenu};
    top: ${size.header};
    height: calc(100vh - ${size.header});
    transform: none;
    visibility: visible;
  `};
`;

export const Header = styled.div`
  height: ${sizeUnits(6)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: ${sizeUnits(2)};
  padding-right: ${sizeUnits(2)};
  flex-direction: row-reverse;

  ${media(Breakpoint.TABLET)`
    display: none;
  `};
`;

export const MenuLinks = styled.nav`
  display: flex;
  flex-direction: column;
`;

export const MenuLink = styled(Link).attrs(() => ({ variant: ButtonVariant.FLAT, navLink: true }))<
  ComponentProps<typeof Link>
>`
  height: ${sizeUnits(6)};
  padding-left: ${sizeUnits(5)};
  ${labelBold};
  background-color: ${greyScale.get(99)};
  max-width: none;

  &.active {
    background-color: ${skyBlueScale.get(50)} !important;
    color: ${color.white} !important;
  }
`;

export const CloseButton = styled.div.attrs(() => ({ role: 'button', tabIndex: 0 }))`
  cursor: pointer;
  line-height: 0;
`;
