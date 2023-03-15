import { Button } from '@sb/webapp-core/components/buttons';
import { color, media, size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.form.attrs(() => ({ noValidate: true }))`
  ${size.formFieldWidth};

  ${media.media(media.Breakpoint.TABLET)`
    max-width: none;
    display: grid;
    grid-column-gap: ${size.sizeUnits(3)};
    grid-row-gap: ${size.sizeUnits(3)};
    grid-template-columns: 1fr 1fr;

    & > *:nth-child(2) {
      grid-column: 1;
    }
  `}
`;

export const ErrorMessage = styled.p`
  padding-top: ${size.sizeUnits(2)};
  color: ${color.error};
  max-width: 100%;
  text-align: left;
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit' }))`
  margin-top: ${size.sizeUnits(3)};

  ${media.media(media.Breakpoint.TABLET)`
    justify-self: flex-end;
    grid-column: 2;
    margin-top: 0;
  `}
`;

export const FormFieldsRow = styled(size.FormFieldsRow)`
  & + & {
    ${media.media(media.Breakpoint.TABLET)`
      margin-top: 0;
    `};
  }
`;
