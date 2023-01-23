import styled from 'styled-components';
import { labelBold } from '../../../theme/typography';
import { button } from '../../../theme/color';
import { size } from '../../../theme';

export const Container = styled.a`
  ${labelBold};
  border-radius: 4px;
  display: inline-block;
  color: ${button.text};
  border: 1px solid ${button.main};
  background-color: ${button.main};
  padding: 0 ${size.smallContentHorizontalPadding};
  height: 40px;
  line-height: 40px;
  text-decoration: none;
`;
