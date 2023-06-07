import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { ToastActionType, ToastContext, ToasterToast } from '../toastProvider';

const DEFAULT_TOAST_ONSCREEN_TIME = 5000;

export type ToasterToastProps = Omit<ToasterToast, 'id'>;

export const useToast = () => {
  const context = React.useContext(ToastContext);

  if (!context) throw new Error('ToastContext used outside of Provider');

  const { toastState, dispatch } = context;

  const ref = useRef({
    lastMessageId: toastState.lastToastId,
  });

  useEffect(() => {
    ref.current.lastMessageId = toastState.lastToastId;
  }, [toastState.lastToastId]);

  const hideToast = useCallback(
    (id: number) => {
      dispatch({ type: 'DISMISS_TOAST', payload: id });
    },
    [dispatch]
  );

  const toast = useCallback(
    ({ ...props }: ToasterToastProps, { hideDelay = DEFAULT_TOAST_ONSCREEN_TIME }: { hideDelay?: number } = {}) => {
      const newMessageId = ++ref.current.lastMessageId;
      const action: ToastActionType = {
        type: 'ADD_TOAST',
        payload: {
          ...props,
          id: newMessageId,
          open: true,
          onOpenChange: (open) => {
            if (!open) hideToast(newMessageId);
          },
        } as ToasterToast,
      };
      dispatch(action);

      setTimeout(() => {
        dispatch({ type: 'DISMISS_TOAST', payload: newMessageId });
      }, hideDelay);
    },
    [dispatch, hideToast]
  );

  return { toastState, hideToast, toast };
};
