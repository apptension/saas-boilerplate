import { all, takeLatest, takeLeading } from 'redux-saga/effects';
import { subscription } from '../../shared/services/api';
import { handleApiRequest } from '../helpers/handleApiRequest';
import * as subscriptionActions from './subscription.actions';

export function* watchSubscription() {
  yield all([
    takeLeading(subscriptionActions.fetchActiveSubscription, handleApiRequest(subscription.get)),
    takeLatest(subscriptionActions.updateSubscriptionPlan, handleApiRequest(subscription.update)),
    takeLeading(subscriptionActions.fetchAvailableSubscriptionPlans, handleApiRequest(subscription.list)),
    takeLatest(subscriptionActions.cancelSubscription, handleApiRequest(subscription.cancel)),
  ]);
}
