import { createReducer } from '@reduxjs/toolkit';
import { authActions } from '../auth';
import { SubscriptionState } from './subscription.types';

export const INITIAL_STATE: SubscriptionState = {
  activeSubscription: null,
};

const handleResetProfile = () => INITIAL_STATE;

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(authActions.resetProfile, handleResetProfile);
});
