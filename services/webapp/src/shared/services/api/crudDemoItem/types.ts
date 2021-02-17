import { ApiFormSubmitResponse } from '../types';

export interface CrudDemoItem {
  id: string;
  name: string;
}

export type CrudDemoItemApiGetResponseData = CrudDemoItem;
export type CrudDemoItemApiPostRequestData = Omit<CrudDemoItem, 'id'>;
export type CrudDemoItemApiPutRequestData = CrudDemoItem;
export type CrudDemoItemApiPostResponseData = ApiFormSubmitResponse<CrudDemoItem, CrudDemoItem>;
