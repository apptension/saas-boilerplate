import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { authActions } from '../auth';
import * as subscriptionActions from './subscription.actions';
import { SubscriptionState, FetchSubscriptionSuccessPayload } from './subscription.types';

export const INITIAL_STATE: SubscriptionState = {
  activeSubscription: null,
};

const handleFetchSubscriptionSuccess = (
  state: SubscriptionState,
  { payload }: PayloadAction<FetchSubscriptionSuccessPayload>
) => {
  state.activeSubscription = payload;
};

const handleCancelSubscriptionSuccess = (state: SubscriptionState) => {
  state.activeSubscription = null;
};

const handleResetProfile = () => INITIAL_STATE;

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(subscriptionActions.fetchActiveSubscription.resolved, handleFetchSubscriptionSuccess);
  builder.addCase(subscriptionActions.cancelSubscription.resolved, handleCancelSubscriptionSuccess);
  builder.addCase(authActions.resetProfile, handleResetProfile);
});
