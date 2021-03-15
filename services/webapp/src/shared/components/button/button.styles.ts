import styled, { css, ThemeProps } from 'styled-components';
import theme from 'styled-theming';

import { size, transition } from '../../../theme';
import { button } from '../../../theme/color';
import { label, labelBold } from '../../../theme/typography';
import { Breakpoint, media } from '../../../theme/media';
import { ButtonTheme, ButtonVariant } from './button.types';

const disabledButtonStyle = css`
  color: ${button.disabled.text};
  border-color: ${button.disabled.main};

  background: ${theme('variant', {
    [ButtonVariant.PRIMARY]: button.disabled.main,
    [ButtonVariant.SECONDARY]: button.disabled.inverted,
    [ButtonVariant.RAW]: button.disabled.inverted,
    [ButtonVariant.FLAT]: button.disabled.inverted,
  })};
`;

const hoverButtonStyle = css`
  background: ${theme('variant', {
    [ButtonVariant.PRIMARY]: button.hover,
    [ButtonVariant.SECONDARY]: button.inverted,
    [ButtonVariant.RAW]: 'transparent',
    [ButtonVariant.FLAT]: button.flat.hover,
  })};

  color: ${theme('variant', {
    [ButtonVariant.PRIMARY]: button.text,
    [ButtonVariant.SECONDARY]: button.hover,
    [ButtonVariant.RAW]: button.hover,
    [ButtonVariant.FLAT]: button.flat.text,
  })};

  border-color: ${button.hover};
`;

const activeButtonStyle = css`
  background: ${theme('variant', {
    [ButtonVariant.PRIMARY]: button.active,
    [ButtonVariant.SECONDARY]: button.inverted,
    [ButtonVariant.RAW]: button.inverted,
    [ButtonVariant.FLAT]: button.flat.active,
  })};

  color: ${theme('variant', {
    [ButtonVariant.PRIMARY]: button.text,
    [ButtonVariant.SECONDARY]: button.active,
    [ButtonVariant.RAW]: button.active,
    [ButtonVariant.FLAT]: button.flat.activeText,
  })};

  border-color: ${button.active};
`;

const fixedWidthButtonStyle = css`
  width: ${theme('variant', {
    [ButtonVariant.PRIMARY]: '100%',
    [ButtonVariant.SECONDARY]: '100%',
    [ButtonVariant.FLAT]: '100%',
    [ButtonVariant.RAW]: 'auto',
  })};

  min-width: ${theme('variant', {
    [ButtonVariant.PRIMARY]: '288px',
    [ButtonVariant.SECONDARY]: '288px',
    [ButtonVariant.FLAT]: '288px',
    [ButtonVariant.RAW]: '0',
  })};

  ${media(Breakpoint.TABLET)`
    width: auto;
  `};
`;

const fluidWidthButtonStyle = css`
  width: ${theme('variant', {
    [ButtonVariant.PRIMARY]: '100%',
    [ButtonVariant.SECONDARY]: '100%',
    [ButtonVariant.FLAT]: '100%',
    [ButtonVariant.RAW]: 'auto',
  })};

  max-width: ${theme('variant', {
    [ButtonVariant.PRIMARY]: '342px',
    [ButtonVariant.SECONDARY]: '342px',
    [ButtonVariant.FLAT]: '342px',
    [ButtonVariant.RAW]: 'none',
  })};

  ${media(Breakpoint.TABLET)`
    width: auto;
  `};
`;

const fullShape = css`
  padding: ${size.contentVerticalPadding} ${size.smallContentHorizontalPadding};
  height: 40px;
`;

const rawShape = css`
  padding: 0;
  height: auto;
`;

export const Icon = styled.span`
  margin-right: 4px;
  font-size: 0;
  display: inline-flex;
  align-items: center;
`;

const primaryBaseButtonStyle = css`
  justify-content: center;
  ${fullShape};
  ${labelBold};
  border-radius: 4px;
  color: ${button.text};
  border: 1px solid ${button.main};
  background-color: ${button.main};
`;

const secondaryBaseButtonStyle = css`
  justify-content: center;
  ${fullShape};
  ${labelBold};
  border-radius: 4px;
  color: ${button.invertedText};
  border: 1px solid ${button.main};
  background-color: ${button.inverted};
`;

const rawBaseButtonStyle = css`
  justify-content: center;
  ${rawShape};
  ${labelBold};
  border-radius: 4px;
  color: ${button.invertedText};
  border: none;
  background-color: transparent;
`;

const flatBaseButtonStyle = css`
  justify-content: flex-start;
  ${fullShape};
  ${label};
  border-radius: 0;
  color: ${button.flat.text};
  border: none;
  background-color: ${button.inverted};
`;

export const baseButtonStyle = css`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  text-align: center;
  cursor: pointer;

  ${theme('variant', {
    [ButtonVariant.PRIMARY]: primaryBaseButtonStyle,
    [ButtonVariant.SECONDARY]: secondaryBaseButtonStyle,
    [ButtonVariant.FLAT]: flatBaseButtonStyle,
    [ButtonVariant.RAW]: rawBaseButtonStyle,
  })};

  ${theme('fixedWidth', {
    true: fixedWidthButtonStyle,
    false: fluidWidthButtonStyle,
    undefined: fluidWidthButtonStyle,
  })}

  &:not(:disabled) {
    &:focus,
    &:hover {
      ${hoverButtonStyle}
    }

    &:active {
      ${activeButtonStyle}
    }
  }

  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};

  ${theme('isDisabled', {
    true: disabledButtonStyle,
  })};
`;

export const Container = styled.button<ThemeProps<ButtonTheme>>`
  ${baseButtonStyle}
`;
