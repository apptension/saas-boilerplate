import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { HistoryListApiResponseData } from '../../shared/services/api/stripe/history/types';
import { authActions } from '../auth';
import * as stripeActions from './stripe.actions';
import { StripeState } from './stripe.types';

export const INITIAL_STATE: StripeState = {
  transactionHistory: [],
};

const handleFetchStripeTransactionHistorySuccess = (
  state: StripeState,
  { payload }: PayloadAction<HistoryListApiResponseData>
) => {
  state.transactionHistory = payload;
};

const handleResetProfile = () => INITIAL_STATE;

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(stripeActions.fetchStripeTransactionHistory.resolved, handleFetchStripeTransactionHistorySuccess);
  builder.addCase(authActions.resetProfile, handleResetProfile);
});
