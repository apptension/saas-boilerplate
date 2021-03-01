export interface Message {
  id: number;
  text: string;
}

export interface SnackbarState {
  lastMessageId: number;
  messages: Message[];
}
