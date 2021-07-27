import styled from 'styled-components';
import { color, elevation, size, transition } from '../../../../theme';
import { HeaderLogoIcon } from '../../../../images/icons';
import { contentWrapper, sizeUnits } from '../../../../theme/size';
import { Avatar as AvatarBase } from '../../avatar';
import { Breakpoint, media } from '../../../../theme/media';

export const Container = styled.header`
  height: ${size.header};
  border-bottom: 1px solid ${color.greyScale.get(95)};
  background-color: ${color.white};
`;

export const Content = styled.div`
  ${contentWrapper};
  max-width: none;
  height: ${size.header};
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 0;
  position: relative;
  border-bottom: 1px solid ${color.greyScale.get(95)} ${media(Breakpoint.TABLET)`
    justify-content: flex-start;
  `};
`;

export const HeaderLogo = styled(HeaderLogoIcon)``;

export const MenuToggleButton = styled.div.attrs(() => ({ role: 'button', tabIndex: 0 }))`
  display: block;
  width: ${sizeUnits(3)};
  padding: 6px 2px;
  left: ${sizeUnits(2)};
  cursor: pointer;
`;

export const MenuLine = styled.span`
  width: 100%;
  display: block;
  background-color: ${color.black};
  height: 1px;
  margin-top: 3px;
  margin-bottom: 3px;
`;

export const MenuContainer = styled.div`
  ${media(Breakpoint.TABLET)`
    margin-right: auto;
  `}
`;

export const ProfileActions = styled.div`
  position: relative;
  margin-left: ${sizeUnits(1)};
  display: none;

  ${media(Breakpoint.TABLET)`
    display: block;
  `}
`;

export const Menu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
  top: ${sizeUnits(5)};
  min-width: ${sizeUnits(21)};
  text-align: left;
  ${elevation.lightest};
  display: flex;
  flex-direction: column;
  background-color: ${color.white};

  ${(props) =>
    transition.withVisibility({
      isVisible: props.isOpen,
      duration: '0.1s',
      properties: [
        {
          name: 'opacity',
          valueWhenHidden: '0',
          valueWhenVisible: '1',
        },
      ],
    })};

  & > * {
    padding-left: 11px;
  }
`;

export const Avatar = styled(AvatarBase)`
  cursor: pointer;
`;

export const SnackbarMessages = styled.div`
  position: fixed;
  top: ${sizeUnits(1)};
  z-index: 1;
  width: 100%;

  ${media(Breakpoint.TABLET)`
    top: ${sizeUnits(3)};
    width: auto;
    left: 50%;
    transform: translateX(-50%);
  `}
`;
