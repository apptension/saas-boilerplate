import { forwardRef, ReactNode, InputHTMLAttributes } from 'react';
import { ThemeProvider } from 'styled-components';
import { Container, Field, Message, Label, LabelText } from './input.styles';
import { InputTheme } from './input.types';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, required, ...inputProps }: InputProps, ref) => {
    const theme: InputTheme = { invalid: !!error, required };

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
