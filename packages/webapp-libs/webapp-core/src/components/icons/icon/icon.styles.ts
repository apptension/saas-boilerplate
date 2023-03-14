import styled from 'styled-components';
import { Icon } from '@iconify/react';

export const Container = styled(Icon)<{ size: number }>`
  font-size: ${(props) => props.size}px;
  line-height: 0;
`;
