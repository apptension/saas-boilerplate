import styled from 'styled-components';
import { sizeUnits, verticalMargin } from '../../../theme/size';
import { labelBold } from '../../../theme/typography';
import { color } from '../../../theme';

export const Container = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  ${verticalMargin(sizeUnits(3))};
`;

export const Text = styled.span`
  text-align: center;
  color: ${color.greyScale.get(45)};
  ${labelBold}
`;
