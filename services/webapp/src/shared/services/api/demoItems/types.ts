import { ApiFormSubmitResponse } from '../types';

export type FavoriteDemoItemsApiGetResponseData = { item: string }[];

export type FavoriteDemoItemApiPostRequestData = { isFavorite: boolean };
export type FavoriteDemoItemApiPostResponseData = ApiFormSubmitResponse<{ isFavorite: boolean }, void>;
