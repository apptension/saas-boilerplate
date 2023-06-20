import React from 'react';

import { ThemeAction, ThemeState } from './themeProvider.types';
import { getSystemTheme, getTheme, setThemeInDOM } from './themeProvider.utils';

export const themeInitialState: ThemeState = {
  theme: getTheme(getSystemTheme()),
};

setThemeInDOM(themeInitialState.theme);

export const ThemeContext = React.createContext<{
  themeState: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
}>({
  themeState: themeInitialState,
  dispatch: () => undefined,
});
