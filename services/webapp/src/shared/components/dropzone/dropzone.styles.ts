import styled from 'styled-components';
import { sizeUnits } from '../../../theme/size';
import { color, transition } from '../../../theme';
import { microlabel } from '../../../theme/typography';

type ContainerProps = {
  isDragActive: boolean;
};

export const Container = styled.div<ContainerProps>`
  padding: ${sizeUnits(3)};
  text-align: center;
  color: ${color.greyScale.base};
  border: 1px dashed ${(props) => (props.isDragActive ? color.skyBlueScale.base : color.greyScale.get(95))};
  ${microlabel};
  transition: border-color ${transition.primary};
`;

export const Text = styled.span``;
