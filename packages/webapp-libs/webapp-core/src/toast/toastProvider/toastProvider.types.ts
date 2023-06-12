import * as React from 'react';

import { ToastActionElement, ToastProps } from '../toast';

export type ToasterToast = ToastProps & {
  id: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export enum ToastEmitterActions {
  ADD_TOAST = 'ADD_TOAST',
}

export type ToastActionType =
  | {
      type: 'ADD_TOAST';
      payload: ToasterToast;
    }
  | {
      type: 'DISMISS_TOAST';
      payload: number;
    };

export interface ToastState {
  lastToastId: number;
  toasts: ToasterToast[];
}
