import { createAction } from '@reduxjs/toolkit';

import { UNAUTHORIZED } from 'http-status-codes';
import { select } from 'redux-saga/effects';
import {
  createPromiseAction,
  PromiseAction,
  rejectPromiseAction,
  resolvePromiseAction,
} from '../shared/utils/reduxSagaPromise';
import { reportError } from '../shared/utils/reportError';
import history from '../shared/utils/history';
import { ROUTES } from '../routes/app.constants';
import { DEFAULT_LOCALE } from '../i18n';
import { selectLocalesLanguage } from './locales/locales.selectors';

export const actionCreator = (prefix: string) => {
  const prefixActionName = (actionName: string) => [prefix, actionName].join('/');

  return {
    createAction: <T>(actionName: string) => createAction<T>(prefixActionName(actionName)),
    createPromiseAction: <T = void, A = void, B = any>(actionName: string) =>
      createPromiseAction<T, A, B>(prefixActionName(actionName)),
  };
};

export function* navigate(route: string) {
  const locale = yield select(selectLocalesLanguage);
  history.push(`/${locale ?? DEFAULT_LOCALE}${route}`);
}

export function* handleApiError(error: any) {
  if (error.response?.status === UNAUTHORIZED) {
    yield navigate(ROUTES.login);
  } else {
    reportError(error);
  }
}

export function handleApiRequest<Request, Response>(
  apiCall: (payload: Request) => Promise<Response>,
  resolveHandler?: (response: Response) => Generator,
  rejectHandler?: (error: any) => Generator
) {
  return function* (action: PromiseAction<Request, Response>) {
    try {
      const res: Response = yield apiCall(action.payload);
      yield resolvePromiseAction(action, res);
      yield resolveHandler?.(res);
    } catch (error) {
      yield handleApiError(error);
      yield rejectPromiseAction(action, error?.response?.data);
      yield rejectHandler?.(error);
    }
  };
}
