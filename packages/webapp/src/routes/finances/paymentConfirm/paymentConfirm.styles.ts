import { size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  ${size.contentWrapper};
  ${size.verticalPadding(size.sizeUnits(2))};
`;

export const Header = styled.h1`
  ${typography.heading3};
`;

export const Subheader = styled.h2`
  ${typography.heading4};
  margin-top: ${size.sizeUnits(4)};
  margin-bottom: ${size.sizeUnits(3)};
`;
