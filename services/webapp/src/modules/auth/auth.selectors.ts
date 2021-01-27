import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../config/reducers';

export const selectAuthDomain = (state: GlobalState) => state.auth;

export const selectProfile = createSelector(selectAuthDomain, (state) => state.profile);
