import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../app/config/reducers';

export const selectStripeDomain = (state: GlobalState) => state.stripe;

export const selectStripeTransactionHistory = createSelector(selectStripeDomain, (state) => state.transactionHistory);
