import { all, takeLatest, put } from 'redux-saga/effects';
import { reportError } from '../../shared/utils/reportError';
import { startupActions } from '../startup';
import { client, ContentfulAppConfigQuery } from '../../shared/services/contentful';
import { configActions } from './index';

function* fetchConfig() {
  try {
    const { appConfigCollection }: ContentfulAppConfigQuery = yield client.appConfig();
    const data = appConfigCollection?.items[0];
    if (data) {
      yield put(configActions.setAppConfig(data));
    }
  } catch (error) {
    reportError(error);
  }
}

export function* watchConfig() {
  yield all([takeLatest(startupActions.startup, fetchConfig)]);
}
