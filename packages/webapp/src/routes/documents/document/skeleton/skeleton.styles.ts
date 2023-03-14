import { size } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

import { Container as ContainerBase } from '../document.styles';

export const Container = styled(ContainerBase)`
  > * {
    margin-bottom: ${size.sizeUnits(1)};
  }
`;
