import styled from 'styled-components';
import { contentWrapper, horizontalPadding, sizeUnits, verticalPadding } from '../../../theme/size';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(2))};
  ${horizontalPadding(sizeUnits(2))};
`;
