import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import * as stripeActions from './stripe.actions';
import { FetchStripePaymentMethodsSuccessPayload, StripeState } from './stripe.types';

export const INITIAL_STATE: StripeState = {
  paymentMethods: [],
};

const handleFetchStripePaymentMethodsSuccess = (
  state: StripeState,
  { payload }: PayloadAction<FetchStripePaymentMethodsSuccessPayload>
) => {
  state.paymentMethods = payload;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(stripeActions.fetchStripePaymentMethods.resolved, handleFetchStripePaymentMethodsSuccess);
});
