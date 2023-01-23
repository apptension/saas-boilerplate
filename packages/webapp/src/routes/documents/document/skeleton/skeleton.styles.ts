import styled from 'styled-components';
import { Container as ContainerBase } from '../document.styles';
import { sizeUnits } from '../../../../theme/size';

export const Container = styled(ContainerBase)`
  > * {
    margin-bottom: ${sizeUnits(1)};
  }
`;
