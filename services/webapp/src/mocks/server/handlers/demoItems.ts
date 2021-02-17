import { rest } from 'msw';
import {
  FavoriteDemoItemApiPostRequestData,
  FavoriteDemoItemApiPostResponseData,
  FavoriteDemoItemsApiGetResponseData,
} from '../../../shared/services/api/demoItems/types';
import { DEMO_ITEMS_URL, getDemoItemFavoriteUrl } from '../../../shared/services/api/demoItems';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const mockGetFavoritesDemoItems = (response: FavoriteDemoItemsApiGetResponseData = [], status = 200) =>
  rest.get<void, FavoriteDemoItemsApiGetResponseData>([baseUrl, DEMO_ITEMS_URL].join(''), (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockSetFavoriteDemoItem = (
  id = 'item-id',
  response: FavoriteDemoItemApiPostResponseData = { isError: false },
  status = 200
) =>
  rest.post<FavoriteDemoItemApiPostRequestData, FavoriteDemoItemApiPostResponseData>(
    [baseUrl, getDemoItemFavoriteUrl(id)].join(''),
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );
