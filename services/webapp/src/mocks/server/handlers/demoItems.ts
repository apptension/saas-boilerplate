import {rest, PathParams, DefaultBodyType} from 'msw';
import {
  FavoriteDemoItemApiPostRequestData,
  FavoriteDemoItemApiPostResponseData,
  FavoriteDemoItemsApiGetResponseData,
} from '../../../shared/services/api/demoItems/types';
import { DEMO_ITEMS_URL } from '../../../shared/services/api/demoItems';

export const mockGetFavoritesDemoItems = (response: FavoriteDemoItemsApiGetResponseData = [], status = 200) =>
  rest.get<DefaultBodyType, PathParams, FavoriteDemoItemsApiGetResponseData>(DEMO_ITEMS_URL.ALL, (req, res, ctx) => {
    return res(ctx.status(status), ctx.json(response));
  });

export const mockSetFavoriteDemoItem = (
  id = 'item-id',
  response: FavoriteDemoItemApiPostResponseData = { isError: false },
  status = 200
) =>
  rest.post<FavoriteDemoItemApiPostRequestData, PathParams, FavoriteDemoItemApiPostResponseData>(
    DEMO_ITEMS_URL.FAVORITE({ id }),
    (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }
  );
