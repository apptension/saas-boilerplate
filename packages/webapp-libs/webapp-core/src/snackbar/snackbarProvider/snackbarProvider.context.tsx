import React from 'react';

import { SnackbarAction, SnackbarState } from './snackbarProvider.types';

export const snackbarInitialState: SnackbarState = {
  lastMessageId: 0,
  messages: [],
};

export const SnackbarContext = React.createContext<{
  snackbar: SnackbarState;
  dispatch: React.Dispatch<SnackbarAction>;
}>({
  snackbar: snackbarInitialState,
  dispatch: () => undefined,
});
