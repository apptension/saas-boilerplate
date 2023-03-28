declare module 'styled-theming' {
  import { DefaultTheme, FlattenInterpolation, ThemedStyledProps, ThemeProps } from 'styled-components';

  declare function theme<THEME extends DefaultTheme = DefaultTheme, KEY = string>(
    name: keyof THEME,
    values: styledTheming.ThemeMap<THEME, KEY>
  ): styledTheming.ThemeSet<THEME>;

  declare namespace styledTheming {
    type ThemeValueResult<THEME extends DefaultTheme = DefaultTheme> =
      | string
      | FlattenInterpolation<ThemeProps<THEME>>
      | FlattenInterpolation<ThemedStyledProps<any, THEME>>;
    type ThemeValueFn = <THEME extends DefaultTheme = DefaultTheme>(props: ThemeProps<THEME>) => ThemeValueResult;
    type ThemeValue<THEME extends DefaultTheme = DefaultTheme> = ThemeValueFn<THEME> | ThemeValueResult<THEME>;

    type ThemeMap<THEME extends DefaultTheme = DefaultTheme, KEY = string> = Record<KEY, ThemeValue<THEME>>;

    interface VariantMap {
      [key: string]: ThemeMap;
    }

    type ThemeSet<THEME extends DefaultTheme = DefaultTheme> = (props: ThemeProps<THEME>) => string;
    type VariantSet = (props: Record<string, any>) => string;

    function variants(name: string, prop: string, values: VariantMap): VariantSet;
  }

  export = theme;
}
