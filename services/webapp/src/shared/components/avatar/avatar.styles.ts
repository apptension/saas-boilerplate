import styled from 'styled-components';
import { skyBlueScale } from '../../../theme/color';
import { color } from '../../../theme';
import { AvatarProps } from './avatar.component';

export const Container = styled.div<AvatarProps>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  background-color: ${skyBlueScale.get(50)};
  font-size: ${(props) => (props.size ?? 1) * 0.4}px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${color.white};
`;
