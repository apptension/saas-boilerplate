import styled from 'styled-components';
import { labelBold } from '../../../../theme/typography';
import { border, color, transition } from '../../../../theme';
import { sizeUnits } from '../../../../theme/size';

export const Container = styled.label`
  display: inline-block;
`;

export const GhostInput = styled.input`
  position: absolute;
  height: 0;
  width: 0;
  opacity: 0;
`;

export const Label = styled.span`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 50px;
  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};
  width: auto;
  border: 1px solid ${color.radio.main};
  background: ${color.white};
  color: ${color.text};
  cursor: pointer;

  input:checked ~ & {
    background: ${color.radio.main};
    color: ${color.white};
  }

  input:disabled ~ & {
    border-color: ${color.radio.disabled.main};
    color: ${color.radio.disabled.text};
  }

  input:active ~ &,
  input:focus ~ & {
    ${border.outline};
  }

  input:disabled:checked ~ & {
    background-color: ${color.radio.disabled.main};
  }

  input:not(:disabled):not(:checked) ~ &:hover {
    background-color: ${color.radio.hover.main};
    border-color: ${color.radio.hover.border};
    color: ${color.radio.main};
  }
`;

export const LabelText = styled.span`
  ${labelBold};
`;

export const Dot = styled.div`
  display: flex;
  width: ${sizeUnits(2)};
  height: ${sizeUnits(2)};
  background: ${color.white};
  border: 1px solid ${color.radio.main};
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  margin-right: ${sizeUnits(1)};

  &:after {
    content: '';
    width: ${sizeUnits(1)};
    height: ${sizeUnits(1)};
    border-radius: 50%;
    background-color: transparent;
    transition: background-color ${transition.primary};
  }

  input:checked ~ ${/* sc-selector */ Label} > &:after {
    background: ${color.radio.main};
  }

  input:disabled ~ ${/* sc-selector */ Label} > & {
    border-color: ${color.radio.disabled.main};
  }

  input:disabled:checked ~ ${/* sc-selector */ Label} > & {
    &:after {
      background-color: ${color.radio.disabled.main};
    }
  }

  input:not(:disabled):not(:checked) ~ ${/* sc-selector */ Label}:hover > & {
    border-color: ${color.radio.hover.border};

    &:after {
      background-color: ${color.radio.hover.border};
    }
  }
`;
