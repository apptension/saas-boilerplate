import { select } from 'redux-saga/effects';
import { selectLocalesLanguage } from '../locales/locales.selectors';
import history from '../../shared/utils/history';
import { DEFAULT_LOCALE } from '../../i18n';

export function* navigate(route: string) {
  const locale = yield select(selectLocalesLanguage);
  history.push(`/${locale ?? DEFAULT_LOCALE}${route}`);
}
