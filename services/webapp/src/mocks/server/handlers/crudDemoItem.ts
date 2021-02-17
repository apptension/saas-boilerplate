import { rest } from 'msw';
import {
  CrudDemoItemApiGetResponseData,
  CrudDemoItemApiPostRequestData,
  CrudDemoItemApiPostResponseData,
  CrudDemoItemApiPutRequestData,
} from '../../../shared/services/api/crudDemoItem/types';
import { CRUD_DEMO_ITEM_URL } from '../../../shared/services/api/crudDemoItem';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const mockGetCrudDemoItemList = (response: CrudDemoItemApiGetResponseData[] = []) =>
  rest.get<void, CrudDemoItemApiGetResponseData[]>([baseUrl, CRUD_DEMO_ITEM_URL].join(''), (req, res, ctx) => {
    return res(ctx.json(response));
  });

export const mockGetCrudDemoItem = (
  id = 'id',
  response: CrudDemoItemApiGetResponseData = { id: '123', name: 'name' }
) =>
  rest.get<void, CrudDemoItemApiGetResponseData>([baseUrl, CRUD_DEMO_ITEM_URL, `/${id}`].join(''), (req, res, ctx) => {
    return res(ctx.json(response));
  });

export const mockUpdateCrudDemoItem = (
  id = 'id',
  response: CrudDemoItemApiPostResponseData = { isError: false, id: '123', name: 'name' },
  status = 200
) =>
  rest.put<CrudDemoItemApiPutRequestData, CrudDemoItemApiPostResponseData>(
    [baseUrl, CRUD_DEMO_ITEM_URL, `/${id}`].join(''),
    (req, res, ctx) => {
      return res(ctx.json(response), ctx.status(status));
    }
  );

export const mockAddCrudDemoItem = (
  response: CrudDemoItemApiPostResponseData = { isError: false, id: '123', name: 'name' },
  status = 200
) =>
  rest.post<CrudDemoItemApiPostRequestData, CrudDemoItemApiPostResponseData>(
    [baseUrl, CRUD_DEMO_ITEM_URL].join(''),
    (req, res, ctx) => {
      return res(ctx.json(response), ctx.status(status));
    }
  );

export const mockDeleteCrudDemoItem = (id = 'id', status = 204) =>
  rest.delete([baseUrl, CRUD_DEMO_ITEM_URL, `/${id}`].join(''), (req, res, ctx) => {
    return res(ctx.status(status));
  });
