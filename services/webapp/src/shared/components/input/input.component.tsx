import React, { forwardRef } from 'react';
import { Container, Field, Message } from './input.styles';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ error, ...inputProps }: InputProps, ref) => {
  return (
    <Container>
      <Field {...inputProps} ref={ref} />
      <Message>{error}</Message>
    </Container>
  );
});
