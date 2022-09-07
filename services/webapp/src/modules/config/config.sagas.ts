import { all, put, takeLatest } from 'redux-saga/effects';
import { fetchQuery } from 'relay-runtime';
import graphql from 'babel-plugin-relay/macro';

import { reportError } from '../../shared/utils/reportError';
import { relayEnvironment } from '../../shared/services/graphqlApi/relayEnvironment';
import { startupActions } from '../startup';
import { configContentfulAppConfigQuery } from './__generated__/configContentfulAppConfigQuery.graphql';
import { configActions } from './index';

function* fetchConfig() {
  try {
    const { appConfigCollection }: configContentfulAppConfigQuery['response'] = yield fetchQuery(
      relayEnvironment,
      graphql`
        query configContentfulAppConfigQuery {
          appConfigCollection(limit: 1) {
            items {
              name
              privacyPolicy
              termsAndConditions
            }
          }
        }
      `,
      {}
    ).toPromise();

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
