import styled from 'styled-components';
import { injectedFonts, Table as TableBase, Tr as TrBase, Td as TdBase } from '../base.styles';
import { greyScale } from '../../../theme/color';
import { sizeUnits } from '../../../theme/size';
import { heading3, label } from '../../../theme/typography';

export const Container = styled.div`
  ${injectedFonts};
  margin: 0 auto;
  max-width: 548px;
  border: 1px solid ${greyScale.get(85)};
  border-radius: 8px;
  padding-top: ${sizeUnits(5)};
`;

export const Table = styled(TableBase)`
  text-align: center;
`;

export const Tr = styled(TrBase)``;

export const Td = styled(TdBase).attrs(() => ({ align: 'center' }))`
  padding-bottom: ${sizeUnits(5)};
`;

export const Text = styled(Td)`
  ${label};
  color: ${greyScale.get(15)};
`;

export const Title = styled(Td)`
  ${heading3}
  color: ${greyScale.get(15)};
`;
