import { useEffect, useMemo, useReducer } from 'react';

import { reportError } from '../../utils/reportError';
import { ThemeContext, themeInitialState } from './themeProvider.context';
import { themeReducer } from './themeProvider.reducer';
import { THEME_DEFAULT_STORAGE_KEY, ThemeProviderProps } from './themeProvider.types';

export const ThemeProvider = ({ children, storageKey = THEME_DEFAULT_STORAGE_KEY }: ThemeProviderProps) => {
  const [themeState, dispatch] = useReducer(themeReducer, themeInitialState);
  const value = useMemo(() => ({ themeState, dispatch }), [themeState, dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, themeState.theme);
    } catch (e) {
      reportError(e);
    }
  }, [themeState.theme, storageKey]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
