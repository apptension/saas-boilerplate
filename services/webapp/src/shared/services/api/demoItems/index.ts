import { client } from '../client';
import { FavoriteDemoItemApiPostResponseData, FavoriteDemoItemsApiGetResponseData } from './types';

export const DEMO_ITEMS_URL = '/demo/contentful-item-favorite/';
export const DEMO_ITEMS_FAVORITE_URL_SUFFIX = '/demo/contentful-item/:id/favorite/';

export const getDemoItemFavoriteUrl = (id: string) => DEMO_ITEMS_FAVORITE_URL_SUFFIX.replace(':id', id);

export const allFavorites = async () => {
  const res = await client.get<FavoriteDemoItemsApiGetResponseData>(DEMO_ITEMS_URL);
  return res.data;
};

export const setFavorite = async ({ id, isFavorite = true }: { id: string; isFavorite: boolean }) => {
  const makeRequest = isFavorite ? client.post : client.delete;
  const res = await makeRequest<FavoriteDemoItemApiPostResponseData>(getDemoItemFavoriteUrl(id));
  return res.data;
};
