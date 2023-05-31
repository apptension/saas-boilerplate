import { color, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.form.attrs(() => ({ noValidate: true }))`
  ${size.formFieldWidth};
`;

export const ErrorMessage = styled(typography.MicroLabel)`
  position: absolute;
  color: ${color.error};
`;
