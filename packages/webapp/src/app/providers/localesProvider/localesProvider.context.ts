import { Dispatch, createContext } from 'react';

import { LocalesAction, LocalesState } from './localesProvider.types';

export const localesInitialState: LocalesState = {
  language: null,
};

export const LocalesContext = createContext<{
  locales: LocalesState;
  dispatch: Dispatch<LocalesAction>;
}>({
  locales: localesInitialState,
  dispatch: () => undefined,
});
