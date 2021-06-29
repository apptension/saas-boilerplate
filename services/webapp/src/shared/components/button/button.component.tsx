import { ButtonHTMLAttributes, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { Icon, Container } from './button.styles';
import { ButtonColor, ButtonSize, ButtonTheme, ButtonVariant } from './button.types';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor | string;
  icon?: ReactNode;
  fixedWidth?: boolean;
};

export const Button = ({
  children,
  icon,
  fixedWidth,
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.NORMAL,
  color = ButtonColor.PRIMARY,
  disabled = false,
  ...other
}: ButtonProps) => {
  const theme: ButtonTheme = { variant, size, color, isDisabled: disabled, fixedWidth };

  return (
    <ThemeProvider theme={theme}>
      <Container disabled={disabled} {...other}>
        {icon ? <Icon>{icon}</Icon> : null}
        {children}
      </Container>
    </ThemeProvider>
  );
};
