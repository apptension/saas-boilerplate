import { useMemo, useReducer } from 'react';

import { ThemeContext, themeInitialState } from './themeProvider.context';
import { themeReducer } from './themeProvider.reducer';
import { ThemeProviderProps } from './themeProvider.types';

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeState, dispatch] = useReducer(themeReducer, themeInitialState);
  const value = useMemo(() => ({ themeState, dispatch }), [themeState, dispatch]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
