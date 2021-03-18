import { all, takeLatest } from 'redux-saga/effects';

import { subscription } from '../../shared/services/api';
import { handleApiRequest } from '../helpers/handleApiRequest';
import * as subscriptionActions from './subscription.actions';

export function* watchSubscription() {
  yield all([takeLatest(subscriptionActions.fetchActiveSubscription, handleApiRequest(subscription.get))]);
}
