import styled from 'styled-components';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';
import { heading3, label, labelBold } from '../../../theme/typography';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(2))};
`;

export const Header = styled.h1`
  ${heading3};
`;

export const Row = styled.div`
  ${label};
  margin-top: ${sizeUnits(1)};
`;

export const RowValue = styled.span`
  margin-left: ${sizeUnits(1)};
  ${labelBold};
`;
