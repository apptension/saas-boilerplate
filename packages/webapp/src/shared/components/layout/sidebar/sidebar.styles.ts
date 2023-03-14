import { ButtonVariant, Link } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { color, media, size, transition, typography, zIndex } from '@saas-boilerplate-app/webapp-core/theme';
import { ComponentProps } from 'react';
import styled from 'styled-components';

export const Container = styled.div<{ isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${color.greyScale.get(99)};
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

  ${media.media(media.Breakpoint.TABLET)`
    width: ${size.sideMenu};
    top: ${size.header};
    height: calc(100vh - ${size.header});
    transform: none;
    visibility: visible;
  `};
`;

export const Header = styled.div`
  height: ${size.sizeUnits(6)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: ${size.sizeUnits(2)};
  padding-right: ${size.sizeUnits(2)};
  flex-direction: row-reverse;

  ${media.media(media.Breakpoint.TABLET)`
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
  height: ${size.sizeUnits(6)};
  padding-left: ${size.sizeUnits(5)};
  ${typography.labelBold};
  background-color: ${color.greyScale.get(99)};
  max-width: none;

  &.active {
    background-color: ${color.skyBlueScale.get(50)} !important;
    color: ${color.white} !important;
  }
`;

export const CloseButton = styled.div.attrs(() => ({ role: 'button', tabIndex: 0 }))`
  cursor: pointer;
  line-height: 0;
`;
