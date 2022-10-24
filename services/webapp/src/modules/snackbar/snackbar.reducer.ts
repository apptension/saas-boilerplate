import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import * as snackbarActions from './snackbar.actions';
import { SnackbarState, Message } from './snackbar.types';

export const INITIAL_STATE: SnackbarState = {
  lastMessageId: 0,
  messages: [],
};

const handleShowMessage = (state: SnackbarState, { payload }: PayloadAction<Message>) => {
  state.messages.push(payload);
  state.lastMessageId = payload.id;
};

const handleHideMessage = (state: SnackbarState, { payload }: PayloadAction<number>) => {
  state.messages = state.messages.filter(({ id }) => id !== payload);
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(snackbarActions.showMessage, handleShowMessage);
  builder.addCase(snackbarActions.hideMessage, handleHideMessage);
});
