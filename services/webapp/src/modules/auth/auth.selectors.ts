import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../config/reducers';

export const selectAuthDomain = (state: GlobalState) => state.auth;

export const selectIsLoggedIn = createSelector(selectAuthDomain, (state) => state.isLoggedIn);

export const selectProfile = createSelector(selectAuthDomain, (state) => state.profile);

export const selectProfileInitial = createSelector(
  selectAuthDomain,
  (state) => state.profile?.firstName?.[0]?.toUpperCase() ?? 'U'
);

export const selectProfileEmail = createSelector(selectProfile, (profile) => profile?.email);

export const selectProfileRoles = createSelector(selectProfile, (profile) => profile?.roles ?? []);
