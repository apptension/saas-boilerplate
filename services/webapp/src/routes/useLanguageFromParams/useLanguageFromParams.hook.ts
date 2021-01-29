import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { localesActions } from '../../modules/locales';
import { DEFAULT_LOCALE } from '../../i18n';

export interface LanguagePathParams {
  lang: string;
}

export const useLocale = () => {
  const { lang } = useParams<LanguagePathParams>();
  return lang || DEFAULT_LOCALE;
};

export const useLocaleUrl = (url: string) => {
  const locale = useLocale();
  return `/${locale}${url}`;
};

export const useLanguageFromParams = () => {
  const dispatch = useDispatch();
  const lang = useLocale();

  useEffect(() => {
    dispatch(localesActions.setLanguage(lang));
  }, [lang, dispatch]);
};
