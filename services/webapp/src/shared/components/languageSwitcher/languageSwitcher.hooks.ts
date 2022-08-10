import { useNavigate, useMatch, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { localesSelectors } from '../../../modules/locales';
import { appLocales, Locale } from '../../../app/config/i18n';
import {LANG_PREFIX} from '../../../app/config/routes';

export const useLanguageRouter = () => {
  const { params: { lang = '' } } = useMatch<'lang', string>(LANG_PREFIX) || { params: {} };
  const navigate = useNavigate();
  const language = useSelector(localesSelectors.selectLocalesLanguage);
  const { pathname } = useLocation();

  const changeLanguage = (language: Locale) => {
    navigate(pathname.replace(lang, language));
  };

  return [{ language, locales: appLocales }, changeLanguage] as const;
};
