import styled from 'styled-components';
import { color } from '../../../../theme';
import { Button } from '../../forms/button';
import { formFieldWidth, sizeUnits, FormFieldsRow as FormFieldsRowBase } from '../../../../theme/size';
import { Breakpoint, media } from '../../../../theme/media';

export const Container = styled.div`
  ${formFieldWidth};

  ${media(Breakpoint.TABLET)`
    max-width: none;
  `}
`;

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  ${media(Breakpoint.TABLET)`
    display: grid;
    grid-column-gap: ${sizeUnits(3)};
    grid-template-columns: 1fr 1fr;
  `}
`;

export const ErrorMessage = styled.p`
  position: absolute;
  color: ${color.error};
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit' }))`
  margin-top: ${sizeUnits(3)};

  ${media(Breakpoint.TABLET)`
    justify-self: flex-end;
    grid-column: 2;
  `}
`;

export const FormFieldsRow = styled(FormFieldsRowBase)`
  & + & {
    ${media(Breakpoint.TABLET)`
      margin-top: 0;
    `};
  }
`;
