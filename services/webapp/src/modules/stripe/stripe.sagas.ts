import { all, takeLatest } from 'redux-saga/effects';

import { stripe } from '../../shared/services/api';
import { handleApiRequest } from '../helpers/handleApiRequest';
import * as stripeActions from './stripe.actions';

export function* watchStripe() {
  yield all([takeLatest(stripeActions.fetchStripePaymentMethods, handleApiRequest(stripe.paymentMethod.list))]);
}
