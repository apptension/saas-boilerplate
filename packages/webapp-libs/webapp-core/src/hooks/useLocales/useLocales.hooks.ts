import { useCallback, useContext } from 'react';

import { LocalesContext } from '../../providers/localesProvider';
import { LocaleCode } from '../../providers/localesProvider/localesProvider.types';

export const useLocales = () => {
  const context = useContext(LocalesContext);

  if (!context) throw new Error('LocalesContext used outside of Provider');

  const { locales, dispatch } = context;

  const setLanguage = useCallback(
    (language: LocaleCode) => {
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    },
    [dispatch]
  );

  return { locales, setLanguage };
};
