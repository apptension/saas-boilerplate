import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

import { Icon, Container } from './button.styles';
import { ButtonTheme, ButtonVariant } from './button.types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fixedWidth?: boolean;
}

export const Button = (props: ButtonProps) => {
  const { children, disabled = false, variant = ButtonVariant.PRIMARY, icon, fixedWidth, ...other } = props;

  const theme: ButtonTheme = { variant, isDisabled: disabled, fixedWidth };

  return (
    <ThemeProvider theme={theme}>
      <Container disabled={disabled} {...other}>
        {icon ? <Icon>{icon}</Icon> : null}
        {children}
      </Container>
    </ThemeProvider>
  );
};
