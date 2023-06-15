import { useCallback, useContext } from 'react';

import { ThemeContext, Themes } from '../../providers/themeProvider';

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) throw new Error('ThemeContext used outside of Provider');

  const {
    themeState: { theme },
    dispatch,
  } = context;

  const setTheme = useCallback(
    (theme: Themes) => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
    [dispatch]
  );

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME', payload: undefined });
  }, [dispatch]);

  return { theme, setTheme, toggleTheme };
};
