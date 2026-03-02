import { ReactNode } from 'react';

import { Locale } from '../../config/i18n';

/**
 * Locale code type - can be a static Locale enum value or a dynamic string
 * from the API (e.g., 'de', 'fr', 'es').
 */
export type LocaleCode = Locale | string;

export type LocalesAction = { type: 'SET_LANGUAGE'; payload: LocaleCode | null };

export interface LocalesState {
  language: LocaleCode | null;
}

export type LocalesProviderProps = {
  children: ReactNode;
};
