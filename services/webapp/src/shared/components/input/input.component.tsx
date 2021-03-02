import React, { forwardRef, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { Container, Field, Message, Label, LabelText } from './input.styles';
import { InputTheme } from './input.types';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string | ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...inputProps }: InputProps, ref) => {
    const theme: InputTheme = { invalid: !!error, required: inputProps.required };

    return (
      <ThemeProvider theme={theme}>
        <Container className={className}>
          <Label>
            <Field {...inputProps} ref={ref} />
            {label && <LabelText>{label}</LabelText>}
          </Label>
          <Message>{error}</Message>
        </Container>
      </ThemeProvider>
    );
  }
);
