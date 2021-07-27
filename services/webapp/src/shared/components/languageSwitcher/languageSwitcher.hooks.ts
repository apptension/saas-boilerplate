import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { localesSelectors } from '../../../modules/locales';
import { appLocales, Locale } from '../../../app/config/i18n';

export const useLanguageRouter = () => {
  const match = useRouteMatch<{ lang: string }>();
  const history = useHistory();
  const language = useSelector(localesSelectors.selectLocalesLanguage);

  const changeLanguage = (language: Locale) => {
    history.push(match.url.replace(match.params.lang, language));
  };

  return [{ language, locales: appLocales }, changeLanguage] as const;
};
