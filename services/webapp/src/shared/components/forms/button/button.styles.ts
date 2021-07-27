import styled, { css, FlattenInterpolation, ThemeProps } from 'styled-components';
import theme from 'styled-theming';
import Color from 'color';
import { size, transition, color } from '../../../../theme';
import { label, labelBold } from '../../../../theme/typography';
import { Breakpoint, media, responsiveValue } from '../../../../theme/media';
import { colorScale, ColorScaleIndex } from '../../../../theme/utils/colorScale';
import { sizeUnits } from '../../../../theme/size';
import { ButtonColor, ButtonSize, ButtonTheme, ButtonVariant } from './button.types';
import { COLOR_SCALES_RECORD } from './button.constants';

type ButtonThemeProps = ThemeProps<ButtonTheme>;

const extractPropsColorScale = ({ theme: { color } }: ButtonThemeProps) =>
  COLOR_SCALES_RECORD[color as ButtonColor] as typeof COLOR_SCALES_RECORD[ButtonColor] | undefined;

export const getColor = (props: ButtonThemeProps) => {
  const propsColorScale = extractPropsColorScale(props);
  return propsColorScale?.base ?? props.theme.color;
};

export const getColorScale = (index: ColorScaleIndex) => (props: ButtonThemeProps) => {
  const propsColorScale = extractPropsColorScale(props);
  const scale = propsColorScale ?? colorScale(props.theme.color);
  return scale.get(index);
};

export const getColorBasedOnColorPropDarkness = (props: ButtonThemeProps) => {
  const propsColor = getColor(props);
  return Color(propsColor).isDark() ? color.white : color.text;
};

const specialStates = ({
  hover,
  active,
  disabled,
  fixedWidth,
  fluidWidth,
}: {
  [key in 'hover' | 'active' | 'disabled' | 'fixedWidth' | 'fluidWidth']?: FlattenInterpolation<ButtonThemeProps>;
}) => css<ButtonThemeProps>`
  &:not(:disabled) {
    &:focus,
    &:hover {
      ${hover}
    }

    &:active {
      ${active}
    }
  }

  ${theme('fixedWidth', {
    true: fixedWidth,
    false: fluidWidth,
    undefined: fluidWidth,
  })}

  ${theme('isDisabled', {
    true: disabled,
  })};
`;

const fullShape = css<ButtonThemeProps>`
  padding: ${theme<ButtonTheme, ButtonSize>('size', {
    [ButtonSize.NORMAL]: css`
      ${size.contentVerticalPadding} ${size.smallContentHorizontalPadding}
    `,
    [ButtonSize.SMALL]: css`
      ${responsiveValue(sizeUnits(0.5), {
        [Breakpoint.TABLET]: sizeUnits(0.75),
      })} ${responsiveValue(sizeUnits(1), {
        [Breakpoint.TABLET]: sizeUnits(1.5),
      })}
    `,
  })};
  height: ${theme<ButtonTheme, ButtonSize>('size', {
    [ButtonSize.NORMAL]: '40px',
    [ButtonSize.SMALL]: '25px',
  })};
`;

const rawShape = css`
  padding: 0;
  height: auto;
`;

const primaryBaseButtonStyle = css`
  justify-content: center;
  ${fullShape};
  ${labelBold};
  border-radius: 4px;
  color: ${getColorBasedOnColorPropDarkness};
  border: 1px solid ${getColor};
  background-color: ${getColor};

  ${specialStates({
    hover: css`
      background: ${getColorScale(65)};
    `,
    active: css`
      background: ${getColorScale(35)};
    `,
    disabled: css`
      background: ${color.greyScale.get(90)};
    `,
  })}
`;

const secondaryBaseButtonStyle = css`
  justify-content: center;
  ${fullShape};
  ${labelBold};
  border-radius: 4px;
  color: ${getColor};
  border: 1px solid ${getColor};
  background-color: ${color.white};

  ${specialStates({
    hover: css`
      color: ${getColorScale(65)};
    `,
    active: css`
      color: ${getColorScale(35)};
    `,
  })}
`;

const rawBaseButtonStyle = css`
  justify-content: center;
  ${rawShape};
  ${labelBold};
  border-radius: 4px;
  color: ${getColor};
  border: none;
  background-color: transparent;

  ${specialStates({
    hover: css`
      color: ${getColorScale(65)};
    `,
    active: css`
      color: ${getColorScale(35)};
    `,
    fixedWidth: css`
      width: auto;
      min-width: 0;
    `,
    fluidWidth: css`
      width: auto;
      max-width: none;
    `,
  })}
`;

const flatBaseButtonStyle = css`
  justify-content: flex-start;
  ${fullShape};
  ${label};
  border-radius: 0;
  color: ${color.text};
  border: none;
  background-color: ${color.white};

  ${specialStates({
    hover: css`
      background: ${getColorScale(98)};
      color: ${getColorScale(15)};
    `,
    active: css`
      background: ${getColorScale(95)};
      color: ${getColorScale(35)};
    `,
  })}
`;

const roundBaseButtonStyle = css`
  color: ${getColor};
  border-radius: 100%;
  width: 32px !important;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background-color: transparent;

  ${specialStates({
    hover: css`
      background: ${getColorScale(98)};
    `,
    active: css`
      background: ${getColorScale(95)};
      color: ${getColorScale(35)};
    `,
    disabled: css`
      opacity: 0.4;
    `,
  })}
`;

export const baseButtonStyle = css<ButtonThemeProps>`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};

  ${specialStates({
    hover: css<ButtonThemeProps>`
      border-color: ${getColorScale(65)};
    `,
    active: css`
      border-color: ${getColorScale(35)};
    `,
    disabled: css<ButtonThemeProps>`
      color: ${color.greyScale.get(70)} !important;
      border-color: ${color.greyScale.get(90)} !important;
    `,
    fluidWidth: css<ButtonThemeProps>`
      width: 100%;
      max-width: 342px;

      ${media(Breakpoint.TABLET)`
        width: auto;
      `};
    `,
    fixedWidth: css<ButtonThemeProps>`
      width: 100%;
      min-width: 288px;

      ${media(Breakpoint.TABLET)`
        width: auto;
      `};
    `,
  })}

  ${theme<ButtonTheme, ButtonVariant>('variant', {
    [ButtonVariant.PRIMARY]: primaryBaseButtonStyle,
    [ButtonVariant.SECONDARY]: secondaryBaseButtonStyle,
    [ButtonVariant.FLAT]: flatBaseButtonStyle,
    [ButtonVariant.RAW]: rawBaseButtonStyle,
    [ButtonVariant.ROUND]: roundBaseButtonStyle,
  })};
`;

export const Container = styled.button<ButtonThemeProps>`
  ${baseButtonStyle}
`;

export const Icon = styled.span`
  margin-right: 4px;
  font-size: 0;
  display: inline-flex;
  align-items: center;
`;
