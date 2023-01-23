export interface Message {
  id: number;
  text: string | null;
}

export interface SnackbarState {
  lastMessageId: number;
  messages: Message[];
}
