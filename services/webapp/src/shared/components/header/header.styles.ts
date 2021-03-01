import styled from 'styled-components';
import { elevation, size } from '../../../theme';
import { greyScale } from '../../../theme/color';
import { ReactComponent as HeaderLogoSvg } from '../../../images/icons/headerLogo.svg';
import { contentWrapper, sizeUnits } from '../../../theme/size';
import { Avatar as AvatarBase } from '../avatar';

export const Container = styled.header`
  height: ${size.header}px;
  border-bottom: 1px solid ${greyScale.get(95)};
`;

export const Content = styled.div`
  ${contentWrapper};
  height: ${size.header}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 0;
`;

export const HeaderLogo = styled(HeaderLogoSvg)``;

export const GlobalActions = styled.div``;

export const ProfileActions = styled.div`
  position: relative;
`;

export const Menu = styled.div`
  position: absolute;
  right: 0;
  top: ${sizeUnits(5)}px;
  min-width: ${sizeUnits(21)}px;
  text-align: left;
  ${elevation.elevationLightest};
  display: flex;
  flex-direction: column;
`;

export const Avatar = styled(AvatarBase)`
  cursor: pointer;
`;
