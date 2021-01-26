import styled, { css, ThemeProps } from 'styled-components';
import theme from 'styled-theming';

import { border, color, size } from '../../../theme';
import { ButtonVariant, ButtonTheme } from './button.types';

const disabledButtonStyle = css`
  background: ${color.disabled};

  color: ${theme('variant', {
    [ButtonVariant.PRIMARY]: color.black,
    [ButtonVariant.SECONDARY]: color.secondary,
  })};
`;

export const Container = styled.button<ThemeProps<ButtonTheme>>`
  padding: ${size.contentVerticalPadding}px ${size.contentHorizontalPadding}px;
  border: ${border.regular};

  color: ${theme('variant', {
    [ButtonVariant.PRIMARY]: color.primary,
    [ButtonVariant.SECONDARY]: color.secondary,
  })};

  ${theme('isDisabled', {
    true: disabledButtonStyle,
  })};
`;
