import { useLocation, useMatch, useNavigate } from 'react-router';

import { Locale, appLocales } from '../../../app/config/i18n';
import { LANG_PREFIX } from '../../../app/config/routes';
import { useLocales } from '../../hooks';

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
