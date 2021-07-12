import styled from 'styled-components';
import { skyBlueScale } from '../../../theme/color';
import { color } from '../../../theme';
import { AvatarProps } from './avatar.component';

type ContainerProps = AvatarProps & { hasImage: boolean };

export const Container = styled.div<ContainerProps>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  background-color: ${skyBlueScale.get(50)};
  font-size: ${(props) => (props.size ?? 1) * 0.4}px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${color.white};
  overflow: hidden;
`;

export const Image = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;
