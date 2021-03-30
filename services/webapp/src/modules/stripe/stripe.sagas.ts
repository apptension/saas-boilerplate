import { all, put, takeLatest } from 'redux-saga/effects';

import { stripe } from '../../shared/services/api';
import { handleApiRequest } from '../helpers/handleApiRequest';
import * as stripeActions from './stripe.actions';

function* handlePaymentMethodDeleted() {
  yield put(stripeActions.fetchStripePaymentMethods());
}

export function* watchStripe() {
  yield all([
    takeLatest(stripeActions.fetchStripePaymentMethods, handleApiRequest(stripe.paymentMethod.list)),
    takeLatest(stripeActions.fetchStripeTransactionHistory, handleApiRequest(stripe.history.list)),
    takeLatest(stripeActions.setDefaultStripePaymentMethod, handleApiRequest(stripe.paymentMethod.setDefault)),
    takeLatest(stripeActions.deleteStripePaymentMethod, handleApiRequest(stripe.paymentMethod.remove)),
    takeLatest(stripeActions.deleteStripePaymentMethod.resolved, handlePaymentMethodDeleted),
  ]);
}
