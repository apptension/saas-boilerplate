import { useParams } from 'react-router-dom';

import { DEFAULT_LOCALE, Locale } from '../../config/i18n';

export type LanguagePathParams = {
  lang: Locale;
};

export const useLocale = () => {
  const { lang } = useParams<LanguagePathParams>();
  return lang ?? DEFAULT_LOCALE;
};
