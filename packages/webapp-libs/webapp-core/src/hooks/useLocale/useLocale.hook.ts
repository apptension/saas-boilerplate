import { useParams } from 'react-router-dom';

import { DEFAULT_LOCALE, Locale } from '../../config/i18n';

export type LanguagePathParams = {
  lang: string;
};

/**
 * Get the current locale from URL parameters.
 * Returns the locale code from the URL path or the default locale.
 * 
 * This hook supports dynamic locales - any valid locale code from the API
 * will be accepted, not just the statically defined ones.
 */
export const useLocale = (): Locale | string => {
  const { lang } = useParams<LanguagePathParams>();
  return lang ?? DEFAULT_LOCALE;
};
