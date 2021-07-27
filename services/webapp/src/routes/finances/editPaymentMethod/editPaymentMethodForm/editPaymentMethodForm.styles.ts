import styled from 'styled-components';
import { Button } from '../../../../shared/components/forms/button';
import { sizeUnits } from '../../../../theme/size';

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  width: 100%;
  max-width: 480px;
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit' }))`
  margin-top: ${sizeUnits(5)};
  width: 100%;
  max-width: none;
`;
