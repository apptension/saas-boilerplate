import { color, size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.form.attrs(() => ({ noValidate: true }))``;

export const ErrorMessage = styled.p`
  color: ${color.error};
  font-size: 10px;
  margin-top: ${size.sizeUnits(1)};
`;
