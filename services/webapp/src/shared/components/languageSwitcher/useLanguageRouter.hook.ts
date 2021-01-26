import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { localesSelectors } from '../../../modules/locales';
import { appLocales } from '../../../i18n';

interface LocaleData {
  language: string | null;
  locales: string[];
}

type LanguageChanger = (language: string) => void;

export const useLanguageRouter = (): [LocaleData, LanguageChanger] => {
  const match = useRouteMatch<{ lang: string }>();
  const history = useHistory();
  const language = useSelector(localesSelectors.selectLocalesLanguage);

  const changeLanguage: LanguageChanger = language => {
    history.push(match.url.replace(match.params.lang, language));
  };

  return [{ language, locales: appLocales }, changeLanguage];
};
