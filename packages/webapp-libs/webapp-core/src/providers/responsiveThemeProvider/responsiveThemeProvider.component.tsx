import { ReactNode, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import { useWindowListener } from '../../hooks/useWindowListener';
import { media } from '../../theme';

export type ResponsiveThemeProviderProps = {
  children: ReactNode;
  activeBreakpoint?: media.Breakpoint;
};

export const ResponsiveThemeProvider = ({ children, ...defaultTheme }: ResponsiveThemeProviderProps) => {
  const getTheme = () => ({ activeBreakpoint: media.getActiveBreakpoint(), ...defaultTheme });

  const [theme, setTheme] = useState(getTheme());
  const handleResize = () => setTheme(getTheme());
  useWindowListener('resize', handleResize, { throttle: 200 });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
