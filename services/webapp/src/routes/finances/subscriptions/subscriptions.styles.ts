import styled from 'styled-components';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(3))};

  h1,
  h2,
  h3 {
    margin-bottom: ${sizeUnits(3)};
  }
`;
