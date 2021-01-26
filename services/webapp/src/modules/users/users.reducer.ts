import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import { User, UsersState } from './users.types';
import * as actions from './users.actions';

export const INITIAL_STATE: UsersState = {
  users: [],
};

const handleFetchUsers = (state: UsersState) => {
  state.users = [];
};

const handleFetchUsersSuccess = (state: UsersState, { payload }: PayloadAction<User[]>) => {
  state.users = payload;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(actions.fetchUsers, handleFetchUsers);
  builder.addCase(actions.fetchUsers.resolved, handleFetchUsersSuccess);
});
