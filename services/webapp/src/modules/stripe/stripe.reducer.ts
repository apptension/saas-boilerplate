import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import { HistoryListApiResponseData } from '../../shared/services/api/stripe/history/types';
import * as stripeActions from './stripe.actions';
import { FetchStripePaymentMethodsSuccessPayload, StripeState } from './stripe.types';

export const INITIAL_STATE: StripeState = {
  paymentMethods: [],
  transactionHistory: [],
};

const handleFetchStripePaymentMethodsSuccess = (
  state: StripeState,
  { payload }: PayloadAction<FetchStripePaymentMethodsSuccessPayload>
) => {
  state.paymentMethods = payload;
};

const handleFetchStripeTransactionHistorySuccess = (
  state: StripeState,
  { payload }: PayloadAction<HistoryListApiResponseData>
) => {
  state.transactionHistory = payload;
};

const handleDeleteStripePaymentMethod = (state: StripeState, { payload }: PayloadAction<string>) => {
  state.paymentMethods = state.paymentMethods.filter(({ id }) => id !== payload);
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(stripeActions.fetchStripePaymentMethods.resolved, handleFetchStripePaymentMethodsSuccess);
  builder.addCase(stripeActions.fetchStripeTransactionHistory.resolved, handleFetchStripeTransactionHistorySuccess);
  builder.addCase(stripeActions.deleteStripePaymentMethod, handleDeleteStripePaymentMethod);
});
