import styled, { css } from 'styled-components';
import theme from 'styled-theming';
import { sizeUnits } from '../../../theme/size';
import { MicroLabel } from '../../../theme/typography';
import { checkbox } from '../../../theme/color';
import { transition } from '../../../theme';

export const Container = styled.div``;

export const Field = styled.input`
  width: 0;
  position: absolute;
  height: 0;
`;

export const CheckIcon = styled.span`
  visibility: hidden;
  line-height: 0;
`;

export const Checkmark = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  margin-right: ${sizeUnits(1)}px;
  border: 1px solid ${checkbox.idle};
  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};
  color: ${checkbox.icon};

  input:focus ~ &,
  input:hover ~ & {
    border-color: ${checkbox.hover};
  }

  input:active ~ & {
    border-color: ${checkbox.active};
  }

  input:focus ~ & {
    outline: none;
    box-shadow: 0 0 0 2px ${checkbox.outline};
  }

  input:checked ~ & {
    border-color: ${checkbox.main};
    background-color: ${checkbox.main};

    ${CheckIcon} {
      visibility: visible;
    }
  }

  input:checked:focus ~ &,
  input:checked:hover ~ & {
    border-color: ${checkbox.hover};
    background-color: ${checkbox.hover};
  }

  input:checked:active ~ & {
    border-color: ${checkbox.active};
    background-color: ${checkbox.active};
  }

  ${theme('invalid', {
    true: css`
      border-color: ${checkbox.invalid} !important;
    `,
  })};
`;

export const Message = styled(MicroLabel)`
  display: block;
  color: ${checkbox.invalid};
`;

export const Label = styled(MicroLabel)`
  display: inline-flex;
  align-items: center;
`;
