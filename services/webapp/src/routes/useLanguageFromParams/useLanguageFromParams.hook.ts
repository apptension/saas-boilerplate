import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { localesActions } from '../../modules/locales';
import { DEFAULT_LOCALE } from '../../i18n';

export interface LanguagePathParams {
  lang: string;
}

export const useLanguageFromParams = () => {
  const dispatch = useDispatch();
  const { lang } = useParams<LanguagePathParams>();

  useEffect(() => {
    dispatch(localesActions.setLanguage(lang || DEFAULT_LOCALE));
  }, [lang, dispatch]);
};
