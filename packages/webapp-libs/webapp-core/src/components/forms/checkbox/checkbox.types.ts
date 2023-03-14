import { DefaultTheme, ThemeProps } from 'styled-components';

export interface CheckboxTheme extends DefaultTheme {
  invalid?: boolean;
}

export type CheckboxThemeProps = ThemeProps<CheckboxTheme>;
