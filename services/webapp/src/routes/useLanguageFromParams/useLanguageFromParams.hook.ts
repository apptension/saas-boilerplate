import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, generatePath } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { localesActions } from '../../modules/locales';
import { DEFAULT_LOCALE, Locale } from '../../i18n';

export type LanguagePathParams = {
  lang: Locale;
};

export const useLocale = () => {
  const { lang } = useParams<LanguagePathParams>();
  return lang ?? DEFAULT_LOCALE;
};

/**
 * Intended to use in the emails
 * */
export const useGenerateAbsoluteLocalePath = () => {
  const { locale } = useIntl();

  return (path: string, params: Record<string, string | number> = {}) => {
    const localPath = generatePath(path, { ...params, lang: locale });
    const WEB_APP_URL = process.env.REACT_APP_WEB_APP_URL ?? '';
    const separator = WEB_APP_URL.endsWith('/') || localPath.startsWith('/') ? '' : '/';
    return [WEB_APP_URL ?? '', localPath].join(separator);
  };
};

export const useGenerateLocalePath = () => {
  const lang = useLocale();

  return (path: string, params: Record<string, string | number> = {}) => generatePath(path, { ...params, lang });
};

export const useLanguageFromParams = () => {
  const dispatch = useDispatch();
  const lang = useLocale();

  useEffect(() => {
    dispatch(localesActions.setLanguage(lang));
  }, [lang, dispatch]);
};
