import { renderHook } from '@testing-library/react';

import { useTheme } from '../';
import { ThemeContext, Themes } from '../../../providers/themeProvider';

describe('useTheme', () => {
  it('should return theme, setTheme and toggleTheme functions when used inside ThemeProvider', () => {
    const themeState = { theme: Themes.LIGHT };
    const dispatch = jest.fn();

    const wrapper = ({ children }: any) => (
      <ThemeContext.Provider value={{ themeState, dispatch }}>{children}</ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current).toEqual({
      theme: themeState.theme,
      setTheme: expect.any(Function),
      toggleTheme: expect.any(Function),
    });
    expect(typeof result.current.setTheme).toEqual('function');
    expect(typeof result.current.toggleTheme).toEqual('function');
  });

  it('should call dispatch with SET_THEME type and passed theme when setTheme is called', () => {
    const theme = Themes.DARK;
    const themeState = { theme: Themes.LIGHT };
    const dispatch = jest.fn();

    const wrapper = ({ children }: any) => (
      <ThemeContext.Provider value={{ themeState, dispatch }}>{children}</ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    result.current.setTheme(theme);
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_THEME', payload: theme });
  });

  it('should call dispatch with TOGGLE_THEME type and passed theme when toggleTheme is called', () => {
    const themeState = { theme: Themes.LIGHT };
    const dispatch = jest.fn();

    const wrapper = ({ children }: any) => (
      <ThemeContext.Provider value={{ themeState, dispatch }}>{children}</ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    result.current.toggleTheme();
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_THEME', payload: undefined });
  });
});
