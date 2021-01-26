import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { useWindowListener } from '../../hooks/useWindowListener';
import { getActiveBreakpoint } from '../../../theme/media';

export interface ResponsiveThemeProviderProps {
  children: React.ReactNode;
}

export const ResponsiveThemeProvider = ({ children }: ResponsiveThemeProviderProps) => {
  const getTheme = () => ({ activeBreakpoint: getActiveBreakpoint() });

  const [theme, setTheme] = useState(getTheme());
  const handleResize = () => setTheme(getTheme());
  useWindowListener('resize', handleResize, { throttle: 200 });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
