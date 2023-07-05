import { color, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.a`
  ${typography.labelBold};
  ${size.horizontalPadding(size.sizeUnits(2))};
  ${size.verticalPadding(size.sizeUnits(1))}
  border-radius: 4px;
  display: inline-block;
  color: ${color.button.text};
  border: 1px solid ${color.button.main};
  background-color: ${color.button.main};
  text-decoration: none;
`;
