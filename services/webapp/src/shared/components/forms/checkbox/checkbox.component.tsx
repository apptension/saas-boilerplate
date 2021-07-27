import { forwardRef, ReactNode, InputHTMLAttributes } from 'react';
import checkedIcon from '@iconify-icons/ion/checkmark';
import semicheckedIcon from '@iconify-icons/ion/remove-outline';
import { ThemeProvider } from 'styled-components';
import { Container, Field, Message, Label, Checkmark, CheckIcon } from './checkbox.styles';
import { CheckboxTheme } from './checkbox.types';

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: string;
  semiChecked?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ error, label, className, ...checkboxProps }: CheckboxProps, ref) => {
    const icon = checkboxProps.semiChecked ? semicheckedIcon : checkedIcon;
    const theme: CheckboxTheme = { invalid: !!error };

    return (
      <ThemeProvider theme={theme}>
        <Container className={className}>
          <Label>
            <Field type="checkbox" {...checkboxProps} ref={ref} />
            <Checkmark>
              <CheckIcon icon={icon} />
            </Checkmark>
            {label}
          </Label>
          <Message>{error}</Message>
        </Container>
      </ThemeProvider>
    );
  }
);
