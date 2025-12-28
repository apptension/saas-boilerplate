import { Locale } from '@sb/webapp-core/config/i18n';
import { useLocales, useAvailableLocales } from '@sb/webapp-core/hooks';
import { useLocation, useMatch, useNavigate } from 'react-router';

import { LANG_PREFIX } from '../../../app/config/routes';

/**
 * @deprecated Use `useLocales` and `useAvailableLocales` from @sb/webapp-core/hooks directly.
 * This hook is kept for backwards compatibility.
 */
export const useLanguageRouter = () => {
  const {
    params: { lang = '' },
  } = useMatch<'lang', string>(LANG_PREFIX) || { params: {} };
  const navigate = useNavigate();
  const {
    locales: { language },
  } = useLocales();
  const { locales: availableLocales } = useAvailableLocales();
  const { pathname } = useLocation();

  const changeLanguage = (newLanguage: Locale | string) => {
    navigate(pathname.replace(lang, newLanguage));
  };

  // Return available locale codes for backwards compatibility
  const localeCodes = availableLocales.map((l) => l.code);

  return [{ language, locales: localeCodes }, changeLanguage] as const;
};
