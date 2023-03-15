import { Button } from '@sb/webapp-core/components/buttons';
import { size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  width: 100%;
  max-width: 480px;
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit' }))`
  margin-top: ${size.sizeUnits(5)};
  width: 100%;
  max-width: none;
`;
