import { ReactNode } from 'react';

import { Locale } from '../../config/i18n';

export type LocalesAction = { type: 'SET_LANGUAGE'; payload: Locale | null };

export interface LocalesState {
  language: Locale | null;
}

export type LocalesProviderProps = {
  children: ReactNode;
};
