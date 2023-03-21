import styled from 'styled-components';

import { color, size, typography } from '../../theme';

export const Container = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  ${size.verticalMargin(size.sizeUnits(3))};
`;

export const Text = styled.span`
  text-align: center;
  color: ${color.greyScale.get(45)};
  ${typography.labelBold}
`;
