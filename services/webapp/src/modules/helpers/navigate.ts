import { select } from 'redux-saga/effects';
import { generatePath } from 'react-router-dom';
import { selectLocalesLanguage } from '../locales/locales.selectors';
import { browserHistory } from '../../shared/utils/history';
import { DEFAULT_LOCALE, Locale } from '../../app/config/i18n';

export function* navigate(route: string, params: Record<string, string | number> = {}) {
  const lang: Locale = yield select(selectLocalesLanguage) ?? DEFAULT_LOCALE;
  browserHistory.push(generatePath(route, { ...params, lang }));
}
