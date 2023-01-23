import { useState, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { useWindowListener } from '../../../shared/hooks/useWindowListener';
import { getActiveBreakpoint } from '../../../theme/media';

export type ResponsiveThemeProviderProps = {
  children: ReactNode;
};

export const ResponsiveThemeProvider = ({ children }: ResponsiveThemeProviderProps) => {
  const getTheme = () => ({ activeBreakpoint: getActiveBreakpoint() });

  const [theme, setTheme] = useState(getTheme());
  const handleResize = () => setTheme(getTheme());
  useWindowListener('resize', handleResize, { throttle: 200 });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
