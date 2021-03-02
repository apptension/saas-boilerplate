import styled from 'styled-components';
import { sizeUnits } from '../../../theme/size';
import { color, elevation } from '../../../theme';
import { Label } from '../../../theme/typography';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 288px;
`;

export const MessageWrapper = styled.div`
  position: relative;
  padding: ${sizeUnits(2)} 47px ${sizeUnits(2)} ${sizeUnits(2)};
  ${elevation.elevationLightest};
  margin-bottom: ${sizeUnits(2)};
  border-radius: 4px;
  background: ${color.white};
`;

export const MessageText = styled(Label)``;

export const MessageCloseButton = styled.div.attrs(() => ({ role: 'button', tabIndex: 0 }))`
  position: absolute;
  top: 14px;
  right: 14px;
  cursor: pointer;
  line-height: 0;
`;
