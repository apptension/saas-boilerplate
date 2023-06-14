import { Message as MessageBase } from '@sb/webapp-core/components/forms/input/input.styles';
import { circle, color, elevation, media, size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

import { Avatar as AvatarBase } from '../../avatar';

export const Container = styled.div`
  margin-bottom: ${size.sizeUnits(2)};
  grid-area: avatar;
  justify-self: center;
  position: relative;
  width: 80px;
  height: 80px;

  ${media.media(media.Breakpoint.TABLET)`
    margin-bottom: 0;
  `};
`;

export const Avatar = styled(AvatarBase)`
  position: absolute;
  left: 0;
  top: 0;
`;

export const IconContainer = styled.label.attrs(() => ({ tabIndex: 0 }))`
  position: absolute;
  left: -${size.sizeUnits(1)};
  top: -${size.sizeUnits(1)};
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${color.primary};
  color: ${color.white};
  cursor: pointer;
  ${circle(size.sizeUnits(4))}
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
