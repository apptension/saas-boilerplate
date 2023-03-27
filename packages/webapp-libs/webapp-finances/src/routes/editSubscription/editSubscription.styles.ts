import { size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.contentWrapper};
  ${size.verticalPadding(size.sizeUnits(3))};
`;

export const Header = styled.h1`
  ${typography.heading3};
  margin-bottom: ${size.sizeUnits(2)};
`;

export const Subheader = styled.h2`
  ${typography.heading4}
`;
