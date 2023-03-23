import { color, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

import { Table as TableBase, Td as TdBase, Tr as TrBase, injectedFonts } from '../base.styles';

export const Container = styled.div`
  ${injectedFonts};
  margin: 0 auto;
  max-width: 548px;
  border: 1px solid ${color.greyScale.get(85)};
  border-radius: 8px;
  padding-top: ${size.sizeUnits(5)};
`;

export const Table = styled(TableBase)`
  text-align: center;
`;

export const Tr = styled(TrBase)``;

export const Td = styled(TdBase).attrs(() => ({ align: 'center' }))`
  padding-bottom: ${size.sizeUnits(5)};
`;

export const Text = styled(Td)`
  ${typography.label};
  color: ${color.greyScale.get(15)};
`;

export const Title = styled(Td)`
  ${typography.heading3};
  color: ${color.greyScale.get(15)};
`;
