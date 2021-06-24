import { join } from 'path';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, generatePath } from 'react-router-dom';
import { localesActions } from '../../modules/locales';
import { DEFAULT_LOCALE, Locale } from '../../i18n';

export type LanguagePathParams = {
  lang: Locale;
};

export const useLocale = () => {
  const { lang } = useParams<LanguagePathParams>();
  return lang ?? DEFAULT_LOCALE;
};

export const useGenerateLocalePath = () => {
  const lang = useLocale();

  return (path: string, params: Record<string, string | number> = {}, config?: { absolute: boolean }) => {
    const localPath = generatePath(path, { ...params, lang });
    if (config?.absolute) {
      return join(process.env.REACT_APP_WEB_APP_URL ?? '', localPath);
    }
    return localPath;
  };
};

export const useLanguageFromParams = () => {
  const dispatch = useDispatch();
  const lang = useLocale();

  useEffect(() => {
    dispatch(localesActions.setLanguage(lang));
  }, [lang, dispatch]);
};
