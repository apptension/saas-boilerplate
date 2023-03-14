import { useMemo, useReducer } from 'react';

import { LocalesContext, localesInitialState } from './localesProvider.context';
import { localesReducer } from './localesProvider.reducer';
import { LocalesProviderProps } from './localesProvider.types';

export const LocalesProvider = ({ children }: LocalesProviderProps) => {
  const [locales, dispatch] = useReducer(localesReducer, localesInitialState);
  const value = useMemo(() => ({ locales, dispatch }), [locales, dispatch]);

  return <LocalesContext.Provider value={value}>{children}</LocalesContext.Provider>;
};

export default LocalesProvider;
