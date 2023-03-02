import { assertUnreachable } from '../../../shared/utils/assertUnreachable';
import { SnackbarAction, SnackbarState } from './snackbarProvider.types';

export const snackbarReducer = (state: SnackbarState, { type, payload }: SnackbarAction) => {
  switch (type) {
    case 'SHOW_MESSAGE':
      return {
        ...state,
        lastMessageId: payload.id,
        messages: [...state.messages, payload],
      };
    case 'HIDE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(({ id }) => id !== payload),
      };
    default:
      return assertUnreachable(type, 'Cannot resolve locales reducer action type');
  }
};
