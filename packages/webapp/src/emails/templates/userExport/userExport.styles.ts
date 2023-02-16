import styled from 'styled-components';

import { horizontalMargin, sizeUnits } from '../../../theme/size';
import { label } from '../../../theme/typography';

export const Text = styled.p`
  ${label};
  ${horizontalMargin(sizeUnits(2))};
  text-align: left;
`;
