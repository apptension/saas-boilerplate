import { reportError } from '../../utils/reportError';
import { THEME_DEFAULT_STORAGE_KEY, Themes } from './themeProvider.types';

const MEDIA = '(prefers-color-scheme: dark)';

export const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent): Themes => {
  if (!e) e = window.matchMedia(MEDIA);
  const isDark = e.matches;
  return isDark ? Themes.DARK : Themes.LIGHT;
};

export const setThemeInDOM = (theme: Themes) => {
  const classList = document.querySelector('html')?.classList;
  classList?.remove?.(theme === Themes.LIGHT ? Themes.DARK : Themes.LIGHT);
  classList?.add?.(theme);
};

export const getTheme = (fallback: Themes, storageKey = THEME_DEFAULT_STORAGE_KEY) => {
  let theme;

  try {
    theme = localStorage.getItem(storageKey) || undefined;
  } catch (e) {
    reportError(e);
  }

  return !theme ? fallback : (theme as Themes);
};
