import { useMemo, useReducer } from 'react';

import { SnackbarContext, snackbarInitialState } from './snackbarProvider.context';
import { snackbarReducer } from './snackbarProvider.reducer';
import { SnackbarProviderProps } from './snackbarProvider.types';

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [snackbar, dispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const value = useMemo(() => ({ snackbar, dispatch }), [snackbar, dispatch]);

  return <SnackbarContext.Provider value={value}>{children}</SnackbarContext.Provider>;
};

export default SnackbarProvider;
