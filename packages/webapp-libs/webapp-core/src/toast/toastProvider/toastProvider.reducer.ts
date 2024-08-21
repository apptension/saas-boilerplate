import { assertUnreachable } from '../../utils';
import { ToastActionType, ToastState } from './toastProvider.types';

export const toastReducer = (state: ToastState, { type, payload }: ToastActionType) => {
  switch (type) {
    case 'ADD_TOAST':
      return {
        ...state,
        lastToastId: payload.id,
        toasts: [...state.toasts, payload],
      };
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(({ id }) => id !== payload),
      };
    default:
      return assertUnreachable(type, 'Cannot resolve toast reducer action type');
  }
};
