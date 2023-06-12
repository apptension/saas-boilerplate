import React from 'react';

import { ToastActionType, ToastState } from './toastProvider.types';

export const toastInitialState: ToastState = {
  lastToastId: 0,
  toasts: [],
};

export const ToastContext = React.createContext<{
  toastState: ToastState;
  dispatch: React.Dispatch<ToastActionType>;
}>({
  toastState: toastInitialState,
  dispatch: () => undefined,
});
