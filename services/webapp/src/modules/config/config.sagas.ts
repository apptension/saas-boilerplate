import { all, takeLatest, put } from 'redux-saga/effects';

import { reportError } from '../../shared/utils/reportError';
import { startupActions } from '../startup';
import { client, ContentfulAppConfigQuery } from '../../shared/services/contentful';
import { configActions } from './index';

function* fetchConfig() {
  try {
    const { appConfigCollection }: ContentfulAppConfigQuery = yield client.appConfig();
    if (appConfigCollection?.items?.[0]) {
      yield put(configActions.setAppConfig(appConfigCollection?.items?.[0]));
    }
  } catch (error) {
    reportError(error);
  }
}

export function* watchConfig() {
  yield all([takeLatest(startupActions.startup, fetchConfig)]);
}
