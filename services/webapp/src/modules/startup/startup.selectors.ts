import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../config/reducers';

export const selectStartupDomain = (state: GlobalState) => state.startup;
export const selectIsProfileStartupCompleted = createSelector(
  selectStartupDomain,
  (state) => state.profileStartupCompleted
);
