import styled from 'styled-components';
import { heading3 } from '../../../theme/typography';
import { horizontalPadding, sizeUnits, verticalPadding } from '../../../theme/size';

export const Container = styled.div`
  ${horizontalPadding(sizeUnits(5))};
  ${verticalPadding(sizeUnits(2))};
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(2)};
`;
