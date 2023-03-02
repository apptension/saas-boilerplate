import { useReducer } from 'react';

import { SnackbarContext, snackbarInitialState } from './snackbarProvider.context';
import { snackbarReducer } from './snackbarProvider.reducer';
import { SnackbarProviderProps } from './snackbarProvider.types';

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [snackbar, dispatch] = useReducer(snackbarReducer, snackbarInitialState);

  return <SnackbarContext.Provider value={{ snackbar, dispatch }}>{children}</SnackbarContext.Provider>;
};

export default SnackbarProvider;
