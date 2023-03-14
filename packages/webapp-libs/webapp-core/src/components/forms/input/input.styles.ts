import styled, { ThemeProps, css } from 'styled-components';
import theme from 'styled-theming';

import { color, size, transition, typography } from '../../../theme';
import { InputTheme } from './input.types';

type InputThemeProps = ThemeProps<InputTheme>;

const FIELD_HEIGHT = 40;

export const Container = styled.div`
  position: relative;
  ${size.formFieldWidth};
`;

export const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const requiredAsteriskStyle = css`
  &:after {
    content: '*';
    color: ${color.error};
  }
`;

export const LabelText = styled(typography.Label)<InputThemeProps>`
  margin-bottom: 4px;
  order: -1;
  transition: color ${transition.primary};
  color: ${color.input.label};

  input:focus + &,
  input:hover + & {
    color: ${color.input.hover};
  }

  input:active + & {
    color: ${color.input.active};
  }

  input:disabled + & {
    color: ${color.input.disabled.label};
  }

  ${theme('invalid', {
    true: css`
      color: ${color.input.invalid} !important;
    `,
  })};

  ${theme('required', {
    true: requiredAsteriskStyle,
  })};
`;

export const Field = styled.input<InputThemeProps>`
  height: ${FIELD_HEIGHT}px;
  color: ${color.input.text};
  min-width: 288px;
  border: 1px solid ${color.input.border};
  box-sizing: border-box;
  border-radius: 4px;
  ${typography.label};
  line-height: ${FIELD_HEIGHT}px;
  padding-left: ${size.sizeUnits(1)};
  padding-right: ${size.sizeUnits(1)};
  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};
  width: 100%;

  &::placeholder {
    color: ${color.input.text};
  }

  &:focus,
  &:hover {
    border-color: ${color.input.hover};
  }

  &:focus::placeholder {
    color: transparent;
  }

  &:active {
    border-color: ${color.input.active};
  }

  &:disabled {
    border-color: ${color.input.disabled.border};
    background-color: ${color.input.disabled.background};
    color: ${color.input.disabled.text};

    &::placeholder {
      color: ${color.input.disabled.text};
    }
  }

  ${theme('invalid', {
    true: css`
      border-color: ${color.input.invalid} !important;
    `,
  })};
`;

export const Message = styled(typography.MicroLabel)`
  position: absolute;
  top: calc(100% + 2px);
  margin: 0;
  color: ${color.input.invalid};
`;
