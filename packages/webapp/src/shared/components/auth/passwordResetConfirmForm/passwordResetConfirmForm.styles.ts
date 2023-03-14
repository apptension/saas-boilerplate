import { Button } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { color, size } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.form.attrs(() => ({ noValidate: true }))``;

export const ErrorMessage = styled.p`
  color: ${color.error};
  font-size: 10px;
  margin-top: ${size.sizeUnits(1)};
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit', fixedWidth: true }))`
  margin-top: ${size.sizeUnits(4)};
`;
