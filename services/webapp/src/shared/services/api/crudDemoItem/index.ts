import { client } from '../client';
import {
  CrudDemoItemApiGetResponseData,
  CrudDemoItemApiPostRequestData,
  CrudDemoItemApiPostResponseData,
  CrudDemoItemApiPutRequestData,
} from './types';

export const CRUD_DEMO_ITEM_URL = '/demo/crud-item/';

export const list = async () => {
  const res = await client.get<CrudDemoItemApiGetResponseData[]>(CRUD_DEMO_ITEM_URL);
  return res.data;
};

export const get = async (id: string) => {
  const res = await client.get<CrudDemoItemApiGetResponseData>(CRUD_DEMO_ITEM_URL + `/${id}`);
  return res.data;
};

export const add = async (data: CrudDemoItemApiPostRequestData) => {
  const res = await client.post<CrudDemoItemApiPostResponseData>(CRUD_DEMO_ITEM_URL, data);
  return res.data;
};

export const update = async (data: CrudDemoItemApiPutRequestData) => {
  const res = await client.put<CrudDemoItemApiPostResponseData>(CRUD_DEMO_ITEM_URL + `/${data.id}/`, data);
  return res.data;
};

export const remove = async (id: string) => {
  const res = await client.delete(CRUD_DEMO_ITEM_URL + `/${id}`);
  return res.data;
};
