import { ReactNode } from 'react';

export interface Message {
  id: number;
  text: string | null;
}

export enum SnackbarEmitterActions {
  SNACKBAR_SHOW_MESSAGE = 'SNACKBAR_SHOW_MESSAGE',
}

export type SnackbarAction = { type: 'SHOW_MESSAGE'; payload: Message } | { type: 'HIDE_MESSAGE'; payload: number };

export interface SnackbarState {
  lastMessageId: number;
  messages: Message[];
}

export type SnackbarProviderProps = {
  children: ReactNode;
};
