import styled from 'styled-components';
import { color, elevation, size } from '../../../theme';
import { greyScale } from '../../../theme/color';
import { ReactComponent as HeaderLogoSvg } from '../../../images/icons/headerLogo.svg';
import { contentWrapper, header, sizeUnits } from '../../../theme/size';
import { Avatar as AvatarBase } from '../avatar';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.header`
  height: ${size.header};
  border-bottom: 1px solid ${greyScale.get(95)};
`;

export const Content = styled.div`
  ${contentWrapper};
  max-width: none;
  height: ${size.header};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  position: relative;

  ${media(Breakpoint.TABLET)`
    justify-content: space-between;
  `}
`;

export const HeaderLogo = styled(HeaderLogoSvg)``;

export const GlobalActions = styled.div``;

export const ProfileActions = styled.div`
  position: relative;
  display: none;

  ${media(Breakpoint.TABLET)`
    display: block;
  `}
`;

export const Menu = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
  top: ${sizeUnits(5)};
  min-width: ${sizeUnits(21)};
  text-align: left;
  ${elevation.elevationLightest};
  display: flex;
  flex-direction: column;
  background-color: ${color.white};

  & > * {
    padding-left: 11px;
  }
`;

export const Avatar = styled(AvatarBase)`
  cursor: pointer;
`;

export const SnackbarMessages = styled.div`
  position: fixed;
  top: calc(${header} + ${sizeUnits(2)});
  right: ${sizeUnits(3)};
  z-index: 1;
`;
