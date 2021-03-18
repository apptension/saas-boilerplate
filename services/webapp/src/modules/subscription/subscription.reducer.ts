import { createReducer, PayloadAction } from '@reduxjs/toolkit';

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

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(subscriptionActions.fetchActiveSubscription.resolved, handleFetchSubscriptionSuccess);
});
