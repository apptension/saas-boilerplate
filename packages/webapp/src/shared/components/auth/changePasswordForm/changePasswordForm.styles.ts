import styled from 'styled-components';
import { FormFieldsRow as FormFieldsRowBase, formFieldWidth, sizeUnits } from '../../../../theme/size';
import { color } from '../../../../theme';
import { Button } from '../../forms/button';
import { Breakpoint, media } from '../../../../theme/media';

export const Container = styled.form.attrs(() => ({ noValidate: true }))`
  ${formFieldWidth};

  ${media(Breakpoint.TABLET)`
    max-width: none;
    display: grid;
    grid-column-gap: ${sizeUnits(3)};
    grid-row-gap: ${sizeUnits(3)};
    grid-template-columns: 1fr 1fr;

    & > *:nth-child(2) {
      grid-column: 1;
    }
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
    margin-top: 0;
  `}
`;

export const FormFieldsRow = styled(FormFieldsRowBase)`
  & + & {
    ${media(Breakpoint.TABLET)`
      margin-top: 0;
    `};
  }
`;
