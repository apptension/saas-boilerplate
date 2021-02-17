export interface DemoItemsState {
  favorites: string[];
}

export interface SetFavoritePayload {
  id: string;
  isFavorite: boolean;
}
