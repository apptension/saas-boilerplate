import { client } from '../client';
import { apiURLs, ExtractURLParams, URLParams } from '../helpers';
import { FavoriteDemoItemApiPostResponseData, FavoriteDemoItemsApiGetResponseData } from './types';

export const DEMO_ITEMS_URL = apiURLs('/demo/', {
  ALL: '/contentful-item-favorite/',
  FAVORITE: ({ id }: URLParams<'id'>) => `/contentful-item/${id}/favorite/`,
});

export const allFavorites = async () => {
  const res = await client.get<FavoriteDemoItemsApiGetResponseData>(DEMO_ITEMS_URL.ALL);
  return res.data;
};

export const setFavorite = async ({
  id,
  isFavorite = true,
}: ExtractURLParams<typeof DEMO_ITEMS_URL.FAVORITE> & { isFavorite?: boolean }) => {
  const makeRequest = isFavorite ? client.post : client.delete;
  const res = await makeRequest<FavoriteDemoItemApiPostResponseData>(DEMO_ITEMS_URL.FAVORITE({ id }));
  return res.data;
};
