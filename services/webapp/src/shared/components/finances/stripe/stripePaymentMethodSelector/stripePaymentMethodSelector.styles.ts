import styled from 'styled-components';
import { color } from '../../../../../theme';

export const Container = styled.div``;

export const PaymentMethodList = styled.ul`
  list-style: none;
`;

export const PaymentMethodListItem = styled.li<{ isSelected: boolean }>`
  border: 1px solid ${({ isSelected }) => (isSelected ? color.primary : color.border)};
  margin-bottom: 10px;
  text-align: center;
  line-height: 40px;
  cursor: pointer;
`;

export const CardElementContainer = styled.div`
  padding: 40px;
`;
