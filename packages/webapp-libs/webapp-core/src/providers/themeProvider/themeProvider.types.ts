import { ReactNode } from 'react';

export const THEME_DEFAULT_STORAGE_KEY = 'theme';

export enum Themes {
  LIGHT = 'light',
  DARK = 'dark',
}

export type ThemeAction = { type: 'SET_THEME'; payload: Themes } | { type: 'TOGGLE_THEME'; payload: undefined };

export interface ThemeState {
  theme: Themes;
}

export type ThemeProviderProps = {
  children: ReactNode;
  storageKey?: string;
};
