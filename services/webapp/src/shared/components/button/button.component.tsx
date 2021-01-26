import React, { ButtonHTMLAttributes } from 'react';
import { ThemeProvider } from 'styled-components';
import { empty } from 'ramda';

import { Container } from './button.styles';
import { ButtonTheme, ButtonVariant } from './button.types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = ({
  children,
  className,
  disabled = false,
  variant = ButtonVariant.PRIMARY,
  onClick = empty,
  ...other
}: ButtonProps) => {
  const theme: ButtonTheme = { variant, isDisabled: disabled };
  return (
    <ThemeProvider theme={theme}>
      <Container onClick={onClick} className={className} disabled={disabled} {...other}>
        {children}
      </Container>
    </ThemeProvider>
  );
};
