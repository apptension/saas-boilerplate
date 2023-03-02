import { Dispatch, createContext } from 'react';

import { SnackbarAction, SnackbarState } from './snackbarProvider.types';

export const snackbarInitialState: SnackbarState = {
  lastMessageId: 0,
  messages: [],
};

export const SnackbarContext = createContext<{
  snackbar: SnackbarState;
  dispatch: Dispatch<SnackbarAction>;
}>({
  snackbar: snackbarInitialState,
  dispatch: () => undefined,
});
