import { ApiFormSubmitResponse } from '../types';

export type FavoriteDemoItemsApiGetResponseData = { id: string }[];

export type FavoriteDemoItemApiPostRequestData = { isFavorite: boolean };
export type FavoriteDemoItemApiPostResponseData = ApiFormSubmitResponse<{ isFavorite: boolean }, void>;
