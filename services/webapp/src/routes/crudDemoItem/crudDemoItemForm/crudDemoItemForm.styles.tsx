import styled from 'styled-components';
import { color } from '../../../theme';

export const Container = styled.div``;
export const Row = styled.div``;
export const Label = styled.span``;
export const Value = styled.span``;
export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  margin-bottom: 20px;
`;
export const ErrorMessage = styled.p`
  position: absolute;
  color: ${color.error};
`;
