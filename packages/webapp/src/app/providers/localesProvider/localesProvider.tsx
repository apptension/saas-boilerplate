import { useReducer } from 'react';

import { LocalesContext, localesInitialState } from './localesProvider.context';
import { localesReducer } from './localesProvider.reducer';
import { LocalesProviderProps } from './localesProvider.types';

export const LocalesProvider = ({ children }: LocalesProviderProps) => {
  const [locales, dispatch] = useReducer(localesReducer, localesInitialState);

  return <LocalesContext.Provider value={{ locales, dispatch }}>{children}</LocalesContext.Provider>;
};

export default LocalesProvider;
