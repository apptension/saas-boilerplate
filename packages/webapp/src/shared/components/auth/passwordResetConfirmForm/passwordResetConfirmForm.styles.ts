import styled from 'styled-components';
import { Button } from '../../forms/button';
import { sizeUnits } from '../../../../theme/size';
import { color } from '../../../../theme';

export const Container = styled.form.attrs(() => ({ noValidate: true }))``;

export const ErrorMessage = styled.p`
  color: ${color.error};
  font-size: 10px;
  margin-top: ${sizeUnits(1)};
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit', fixedWidth: true }))`
  margin-top: ${sizeUnits(4)};
`;
