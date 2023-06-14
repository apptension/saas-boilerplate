import { color, elevation, size, transition } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
`;

export const ToggleButton = styled.div.attrs(() => ({ role: 'button', tabIndex: 0 }))`
  position: relative;
  display: flex;
  width: ${size.sizeUnits(3)};
  height: ${size.sizeUnits(3)};
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const ToggleButtonCircle = styled.div`
  /* background-color: ${color.skyBlueScale.get(50)}; */
  width: 4px;
  height: 4px;
  border-radius: 50%;
  display: block;
  ${size.verticalMargin('2px')};
  flex-shrink: 0;
`;

export const Menu = styled.div`
  position: absolute;
  top: 0;
  right: ${size.sizeUnits(3)};
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
  min-width: ${size.sizeUnits(21)};
  text-align: left;
  ${elevation.lightest};
  display: flex;
  flex-direction: column;

  & > * {
    padding-left: 11px;
  }
`;
