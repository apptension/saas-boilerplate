import styled from 'styled-components';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';
import { Button } from '../../../shared/components/button';
import { color } from '../../../theme';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(3))};
`;

export const Form = styled.form``;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit' }))``;

export const ErrorMessage = styled.p`
  position: absolute;
  color: ${color.error};
`;
