import styled from 'styled-components';
import { Avatar as AvatarBase } from '../../avatar';
import { sizeUnits } from '../../../../theme/size';
import { Breakpoint, media } from '../../../../theme/media';
import { circle, color, elevation } from '../../../../theme';
import { Message as MessageBase } from '../../forms/input/input.styles';

export const Container = styled.div`
  margin-bottom: ${sizeUnits(2)};
  grid-area: avatar;
  justify-self: center;
  position: relative;
  width: 80px;
  height: 80px;

  ${media(Breakpoint.TABLET)`
    margin-bottom: 0;
  `};
`;

export const Avatar = styled(AvatarBase).attrs(() => ({ size: 80 }))`
  position: absolute;
  left: 0;
  top: 0;
`;

export const IconContainer = styled.label.attrs(() => ({ tabIndex: 0 }))`
  position: absolute;
  left: -${sizeUnits(1)};
  top: -${sizeUnits(1)};
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${color.primary};
  color: ${color.white};
  cursor: pointer;
  ${circle(sizeUnits(4))}
  ${elevation.strong}
`;

export const FileInput = styled.input`
  display: none;
`;

export const Message = styled(MessageBase)`
  position: static;
  grid-area: avatarError;
  text-align: left;
`;
