import React from 'react';

import { ThemeAction, ThemeState } from './themeProvider.types';
import { getSystemTheme, setThemeInDOM } from './themeProvider.utils';

export const themeInitialState: ThemeState = {
  theme: getSystemTheme(),
};

setThemeInDOM(themeInitialState.theme);

export const ThemeContext = React.createContext<{
  themeState: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
}>({
  themeState: themeInitialState,
  dispatch: () => undefined,
});
