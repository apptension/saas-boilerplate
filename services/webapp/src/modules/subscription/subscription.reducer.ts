import { createReducer } from '@reduxjs/toolkit';
import { authActions } from '../auth';
import * as subscriptionActions from './subscription.actions';
import { SubscriptionState } from './subscription.types';

export const INITIAL_STATE: SubscriptionState = {
  activeSubscription: null,
};

const handleCancelSubscriptionSuccess = (state: SubscriptionState) => {
  state.activeSubscription = null;
};

const handleResetProfile = () => INITIAL_STATE;

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(subscriptionActions.cancelSubscription.resolved, handleCancelSubscriptionSuccess);
  builder.addCase(authActions.resetProfile, handleResetProfile);
});
