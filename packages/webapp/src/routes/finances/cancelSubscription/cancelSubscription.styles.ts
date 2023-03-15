import { size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.contentWrapper};
  ${size.verticalPadding(size.sizeUnits(2))};
`;

export const Header = styled.h1`
  ${typography.heading3};
`;

export const Row = styled.div`
  ${typography.label};
  margin-top: ${size.sizeUnits(1)};
`;

export const RowValue = styled.span`
  margin-left: ${size.sizeUnits(1)};
  ${typography.labelBold};
`;
