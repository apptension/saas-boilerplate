import { color, media, size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.formFieldWidth};

  ${media.media(media.Breakpoint.TABLET)`
    max-width: none;
  `}
`;

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  ${media.media(media.Breakpoint.TABLET)`
    display: grid;
    grid-column-gap: ${size.sizeUnits(3)};
    grid-template-columns: 1fr 1fr;
  `}
`;

export const ErrorMessage = styled.p`
  padding-top: ${size.sizeUnits(2)};
  color: ${color.error};
  max-width: 100%;
  text-align: left;
`;

export const FormFieldsRow = styled(size.FormFieldsRow)`
  & + & {
    ${media.media(media.Breakpoint.TABLET)`
      margin-top: 0;
    `};
  }
`;
