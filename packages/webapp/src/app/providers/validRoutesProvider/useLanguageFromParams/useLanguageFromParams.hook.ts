import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { localesActions } from '../../../../modules/locales';
import { useLocale } from '../../../../shared/hooks/useLocale';

export const useLanguageFromParams = () => {
  const dispatch = useDispatch();
  const lang = useLocale();

  useEffect(() => {
    dispatch(localesActions.setLanguage(lang));
  }, [lang, dispatch]);
};
