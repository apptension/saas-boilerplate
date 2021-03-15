import styled from 'styled-components';
import { MicroLabel } from '../../../../../theme/typography';
import { color } from '../../../../../theme';
import { RadioButton } from '../../../radioButton';

export const Container = styled.div``;

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  width: 100%;
  max-width: 480px;
`;

export const ErrorMessage = styled(MicroLabel)`
  margin-top: 2px;
  color: ${color.error};
`;

export const ProductListContainer = styled.ul`
  list-style: none;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  display: flex;
  padding: 0;
`;

export const ProductListItem = styled.li`
  display: flex;
  min-width: 150px;
`;

export const ProductListItemButton = styled(RadioButton)`
  width: 100%;
`;
