import { ReactNode, useMemo, useReducer } from 'react';

import { ToastContext, toastInitialState } from './toastProvider.context';
import { toastReducer } from './toastProvider.reducer';

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toastState, dispatch] = useReducer(toastReducer, toastInitialState);
  const value = useMemo(() => ({ toastState, dispatch }), [toastState, dispatch]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export default ToastProvider;
