import styled from 'styled-components';
import { color, elevation, size, typography } from '../../../theme';

export const Container = styled.div`
  position: relative;
  padding: ${size.sizeUnits(2)} 47px ${size.sizeUnits(2)} ${size.sizeUnits(2)};
  ${elevation.lightest};
  margin-bottom: ${size.sizeUnits(2)};
  border-radius: 4px;
  background: ${color.white};
`;

export const Text = styled(typography.Label)``;

export const CloseButton = styled.div.attrs(() => ({
  role: 'button',
  tabIndex: 0,
}))`
  position: absolute;
  top: 14px;
  right: 14px;
  cursor: pointer;
  line-height: 0;
`;
