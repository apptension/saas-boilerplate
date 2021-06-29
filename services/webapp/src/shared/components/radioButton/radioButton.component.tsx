import { forwardRef, InputHTMLAttributes } from 'react';
import { Container, GhostInput, Label, Dot, LabelText } from './radioButton.styles';

export type RadioButtonProps = InputHTMLAttributes<HTMLInputElement>;

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ children, className, ...inputProps }: RadioButtonProps, ref) => {
    return (
      <Container className={className}>
        <GhostInput {...inputProps} type="radio" ref={ref} />
        <Label>
          <Dot />
          <LabelText>{children}</LabelText>
        </Label>
      </Container>
    );
  }
);
