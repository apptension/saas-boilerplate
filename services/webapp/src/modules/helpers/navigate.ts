import { select } from 'redux-saga/effects';
import { generatePath } from 'react-router-dom';

import { selectLocalesLanguage } from '../locales/locales.selectors';
import history from '../../shared/utils/history';
import { DEFAULT_LOCALE } from '../../i18n';

export function* navigate(route: string, params: Record<string, string | number> = {}) {
  const lang = yield select(selectLocalesLanguage) ?? DEFAULT_LOCALE;
  history.push(generatePath(route, { ...params, lang }));
}
