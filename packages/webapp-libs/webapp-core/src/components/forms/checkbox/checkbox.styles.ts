import styled, { css } from 'styled-components';
import theme from 'styled-theming';

import { border, color, size, transition, typography } from '../../../theme';
import { Icon } from '../../icons';
import { CheckboxThemeProps } from './checkbox.types';

export const Container = styled.div`
  font-size: 0;
`;

export const Field = styled.input`
  width: 0;
  position: absolute;
  height: 0;
  opacity: 0;
`;

export const CheckIcon = styled(Icon)`
  visibility: hidden;
  font-size: 10px;
  height: 16px;
`;

export const Checkmark = styled.div<CheckboxThemeProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  margin-right: ${size.sizeUnits(1)};
  border: 1px solid ${color.checkbox.idle};
  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};
  color: ${color.checkbox.icon};

  input:focus ~ &,
  input:hover ~ & {
    border-color: ${color.checkbox.hover};
  }

  input:active ~ & {
    border-color: ${color.checkbox.active};
  }

  input:focus ~ & {
    ${border.outline};
  }

  input:checked ~ & {
    border-color: ${color.checkbox.main};
    background-color: ${color.checkbox.main};

    ${CheckIcon} {
      visibility: visible;
    }
  }

  input:checked:focus ~ &,
  input:checked:hover ~ & {
    border-color: ${color.checkbox.hover};
    background-color: ${color.checkbox.hover};
  }

  input:checked:active ~ & {
    border-color: ${color.checkbox.active};
    background-color: ${color.checkbox.active};
  }

  ${theme('invalid', {
    true: css`
      border-color: ${color.checkbox.invalid} !important;
    `,
  })};
`;

export const Message = styled(typography.MicroLabel)`
  display: block;
  color: ${color.checkbox.invalid};
  position: absolute;
`;

export const Label = styled(typography.MicroLabel).attrs(() => ({ as: 'label' }))`
  display: inline-flex;
  align-items: center;
`;
