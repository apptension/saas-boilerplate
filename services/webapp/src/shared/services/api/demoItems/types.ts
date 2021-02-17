import { ApiFormSubmitResponse } from '../types';

export type FavoriteDemoItemsApiGetResponseData = string[];

export type FavoriteDemoItemApiPostRequestData = { isFavorite: boolean };
export type FavoriteDemoItemApiPostResponseData = ApiFormSubmitResponse<{ isFavorite: boolean }, void>;
