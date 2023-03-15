import { Locale, appLocales } from '@sb/webapp-core/config/i18n';
import { useLocales } from '@sb/webapp-core/hooks';
import { useLocation, useMatch, useNavigate } from 'react-router';

import { LANG_PREFIX } from '../../../app/config/routes';

export const useLanguageRouter = () => {
  const {
    params: { lang = '' },
  } = useMatch<'lang', string>(LANG_PREFIX) || { params: {} };
  const navigate = useNavigate();
  const {
    locales: { language },
  } = useLocales();
  const { pathname } = useLocation();

  const changeLanguage = (language: Locale) => {
    navigate(pathname.replace(lang, language));
  };

  return [{ language, locales: appLocales }, changeLanguage] as const;
};
