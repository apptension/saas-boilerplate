import styled from 'styled-components';
import { sizeUnits, verticalMargin } from '../../../../../theme/size';
import { color, elevation, transition } from '../../../../../theme';
import { skyBlueScale } from '../../../../../theme/color';

export const Container = styled.div`
  position: relative;
`;

export const ToggleButton = styled.div.attrs(() => ({ role: 'button', tabIndex: 0 }))`
  position: relative;
  display: flex;
  width: ${sizeUnits(3)};
  height: ${sizeUnits(3)};
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const ToggleButtonCircle = styled.div`
  background-color: ${skyBlueScale.get(50)};
  width: 4px;
  height: 4px;
  border-radius: 50%;
  display: block;
  ${verticalMargin('2px')};
  flex-shrink: 0;
`;

export const Menu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  right: ${sizeUnits(3)};
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
  min-width: ${sizeUnits(21)};
  text-align: left;
  ${elevation.lightest};
  display: flex;
  flex-direction: column;
  background-color: ${color.white};

  ${(props) =>
    transition.withVisibility({
      isVisible: props.isOpen,
      duration: '0.1s',
      properties: [
        {
          name: 'opacity',
          valueWhenHidden: '0',
          valueWhenVisible: '1',
        },
      ],
    })};

  & > * {
    padding-left: 11px;
  }
`;
