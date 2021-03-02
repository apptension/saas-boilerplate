import styled from 'styled-components';
import { MicroLabel } from '../../../../../theme/typography';
import { color } from '../../../../../theme';

export const Container = styled.div``;

export const Form = styled.form`
  width: 400px;
`;

export const ErrorMessage = styled(MicroLabel)`
  margin-top: 2px;
  color: ${color.error};
`;

export const ProductListContainer = styled.ul`
  list-style: none;
`;

export const ProductListItem = styled.li``;
