import styled from 'styled-components';

import { color, size, transition, typography } from '../../../theme';

type ContainerProps = {
  isDragActive: boolean;
  disabled: boolean;
};

export const Container = styled.div<ContainerProps>`
  padding: ${size.sizeUnits(3)};
  text-align: center;
  color: ${color.greyScale.base};
  border: 1px dashed ${(props) => (props.isDragActive ? color.skyBlueScale.base : color.greyScale.get(95))};
  transition: border-color ${transition.primary}, opacity ${transition.primary};
  opacity: ${(props) => (props.disabled ? 0.8 : 1)};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  ${typography.microlabel};
`;

export const Text = styled.span``;
