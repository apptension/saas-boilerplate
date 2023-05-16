import React from 'react';

import { LocalesAction, LocalesState } from './localesProvider.types';

export const localesInitialState: LocalesState = {
  language: null,
};

export const LocalesContext = React.createContext<{
  locales: LocalesState;
  dispatch: React.Dispatch<LocalesAction>;
}>({
  locales: localesInitialState,
  dispatch: () => undefined,
});
