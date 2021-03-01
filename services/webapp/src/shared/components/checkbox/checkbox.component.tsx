import React, { forwardRef, ReactNode } from 'react';
import { Icon } from '@iconify/react';
import checkedIcon from '@iconify-icons/ion/checkmark';
import semicheckedIcon from '@iconify-icons/ion/remove-outline';

import { ThemeProvider } from 'styled-components';
import { Container, Field, Message, Label, Checkmark, CheckIcon } from './checkbox.styles';
import { CheckboxTheme } from './checkbox.types';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
  error?: string;
  semiChecked?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ error, label, ...checkboxProps }: CheckboxProps, ref) => {
    const icon = checkboxProps.semiChecked ? semicheckedIcon : checkedIcon;
    const theme: CheckboxTheme = { invalid: !!error };

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Label>
            <Field type={'checkbox'} {...checkboxProps} ref={ref} />
            <Checkmark>
              <CheckIcon>
                <Icon icon={icon} />
              </CheckIcon>
            </Checkmark>
            {label}
          </Label>
          <Message>{error}</Message>
        </Container>
      </ThemeProvider>
    );
  }
);
