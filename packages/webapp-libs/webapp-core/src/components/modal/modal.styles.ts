import styled from 'styled-components';

import { zIndex, color } from '../../theme';
import { sizeUnits } from '../../theme/size';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${zIndex.overlay}};
`;

export const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${color.white};
  border-radius: 4px;
  max-width: 600px;
  width: calc(100% - ${sizeUnits(6)});
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${sizeUnits(1)};
`;

export const IconContainer = styled.div`
  width: 100%;
  min-height: 36px;
  display: flex;
  justify-content: flex-end;
`;

export const Content = styled.div`
  display: flex;
  min-height: 350px;
  align-items: center;
  justify-content: center;
`;
