import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../config/reducers';

export const selectSnackbarDomain = (state: GlobalState) => state.snackbar;

export const selectSnackbarMessages = createSelector(selectSnackbarDomain, (state) => state.messages);

export const selectLastSnackbarMessageId = createSelector(selectSnackbarDomain, (state) => state.lastMessageId);
