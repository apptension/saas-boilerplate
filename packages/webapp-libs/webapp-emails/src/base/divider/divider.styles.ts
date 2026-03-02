import styled, { css } from 'styled-components';

import { darkModeQuery, emailColors, emailSpacing } from '../../theme';

const spacingMap = {
  sm: emailSpacing.sm,
  md: emailSpacing.md,
  lg: emailSpacing.lg,
};

export const DividerLine = styled.hr<{ $spacing: 'sm' | 'md' | 'lg' }>`
  border: none;
  border-top: 1px solid ${emailColors.border};
  margin: ${({ $spacing }) => spacingMap[$spacing]} 0;
  width: 100%;

  ${darkModeQuery} {
    border-top-color: ${emailColors.borderDark} !important;
  }
`;
