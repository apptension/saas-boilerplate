import { size } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.contentWrapper};
  ${size.verticalPadding(size.sizeUnits(2))};
  ${size.horizontalPadding(size.sizeUnits(2))};
`;
