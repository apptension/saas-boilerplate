import { assertUnreachable } from '../../utils';
import { ThemeAction, ThemeState, Themes } from './themeProvider.types';
import { setThemeInDOM } from './themeProvider.utils';

export const themeReducer = (state: ThemeState, { type, payload }: ThemeAction) => {
  const theme = state.theme === Themes.LIGHT ? Themes.DARK : Themes.LIGHT;
  switch (type) {
    case 'SET_THEME':
      return { ...state, theme: payload };
    case 'TOGGLE_THEME':
      setThemeInDOM(theme);
      return { ...state, theme };
    default:
      return assertUnreachable(type, 'Cannot resolve locales reducer action type');
  }
};
