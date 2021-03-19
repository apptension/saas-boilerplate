import styled from 'styled-components';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(2))};
`;
