import React, { forwardRef } from 'react';

import { Container, Field, Message, Label } from './checkbox.styles';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ error, label, ...checkboxProps }: CheckboxProps, ref) => {
    return (
      <Container>
        <Label>
          <Field type={'checkbox'} {...checkboxProps} ref={ref} />
          {label}
        </Label>
        <Message>{error}</Message>
      </Container>
    );
  }
);
