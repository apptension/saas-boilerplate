declare module 'styled-theming' {
  import { DefaultTheme, FlattenInterpolation, ThemedStyledProps, ThemeProps } from 'styled-components';

  declare function theme(name: string, values: styledTheming.ThemeMap): styledTheming.ThemeSet;

  declare namespace styledTheming {
    type ThemeValueResult =
      | string
      | FlattenInterpolation<ThemeProps<DefaultTheme>>
      | FlattenInterpolation<ThemedStyledProps<any, DefaultTheme>>;
    type ThemeValueFn = (props: ThemeProps<DefaultTheme>) => ThemeValueResult;
    type ThemeValue = ThemeValueFn | ThemeValueResult;

    interface ThemeMap {
      [key: string]: ThemeValue;
    }

    interface VariantMap {
      [key: string]: ThemeMap;
    }

    type ThemeSet = (props: Record<string, any>) => string;
    type VariantSet = (props: Record<string, any>) => string;

    function variants(name: string, prop: string, values: VariantMap): VariantSet;
  }

  export = theme;
}
