import { createSelector } from '@reduxjs/toolkit';

import { GlobalState } from '../../config/reducers';

export const selectUsersDomain = (state: GlobalState) => state.users;

export const selectUsers = createSelector(selectUsersDomain, (state) => state.users);
