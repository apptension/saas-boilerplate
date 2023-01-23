import styled, { css, ThemeProps } from 'styled-components';
import theme from 'styled-theming';
import { label, Label as LabelTypographyBase, MicroLabel } from '../../../../theme/typography';
import { input } from '../../../../theme/color';
import { formFieldWidth, sizeUnits } from '../../../../theme/size';
import { color, transition } from '../../../../theme';
import { InputTheme } from './input.types';

type InputThemeProps = ThemeProps<InputTheme>;

const FIELD_HEIGHT = 40;

export const Container = styled.div`
  position: relative;
  ${formFieldWidth};
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

export const LabelText = styled(LabelTypographyBase)<InputThemeProps>`
  margin-bottom: 4px;
  order: -1;
  transition: color ${transition.primary};
  color: ${input.label};

  input:focus + &,
  input:hover + & {
    color: ${input.hover};
  }

  input:active + & {
    color: ${input.active};
  }

  input:disabled + & {
    color: ${input.disabled.label};
  }

  ${theme('invalid', {
    true: css`
      color: ${input.invalid} !important;
    `,
  })};

  ${theme('required', {
    true: requiredAsteriskStyle,
  })};
`;

export const Field = styled.input<InputThemeProps>`
  height: ${FIELD_HEIGHT}px;
  color: ${input.text};
  min-width: 288px;
  border: 1px solid ${input.border};
  box-sizing: border-box;
  border-radius: 4px;
  ${label};
  line-height: ${FIELD_HEIGHT}px;
  padding-left: ${sizeUnits(1)};
  padding-right: ${sizeUnits(1)};
  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};
  width: 100%;

  &::placeholder {
    color: ${input.text};
  }

  &:focus,
  &:hover {
    border-color: ${input.hover};
  }

  &:focus::placeholder {
    color: transparent;
  }

  &:active {
    border-color: ${input.active};
  }

  &:disabled {
    border-color: ${input.disabled.border};
    background-color: ${input.disabled.background};
    color: ${input.disabled.text};

    &::placeholder {
      color: ${input.disabled.text};
    }
  }

  ${theme('invalid', {
    true: css`
      border-color: ${input.invalid} !important;
    `,
  })};
`;

export const Message = styled(MicroLabel)`
  position: absolute;
  top: calc(100% + 2px);
  margin: 0;
  color: ${input.invalid};
`;
