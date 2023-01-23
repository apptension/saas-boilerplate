import styled from 'styled-components';
import { contentWrapper, sizeUnits, verticalPadding } from '../../../theme/size';
import { heading3, heading4 } from '../../../theme/typography';

export const Container = styled.div`
  ${contentWrapper};
  ${verticalPadding(sizeUnits(2))};
`;

export const Header = styled.h1`
  ${heading3};
`;

export const Subheader = styled.h2`
  ${heading4};
  margin-top: ${sizeUnits(4)};
  margin-bottom: ${sizeUnits(3)};
`;
