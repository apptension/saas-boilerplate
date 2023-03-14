import { DEFAULT_LOCALE, Locale } from '@saas-boilerplate-app/webapp-core/config/i18n';
import { useParams } from 'react-router-dom';

export type LanguagePathParams = {
  lang: Locale;
};

export const useLocale = () => {
  const { lang } = useParams<LanguagePathParams>();
  return lang ?? DEFAULT_LOCALE;
};
