import { actionCreator } from '../helpers/actionCreator';
import {
  CrudDemoItemApiGetResponseData,
  CrudDemoItemApiPostRequestData,
  CrudDemoItemApiPostResponseData,
  CrudDemoItemApiPutRequestData,
} from '../../shared/services/api/crudDemoItem/types';

const { createPromiseAction, createActionRoutine } = actionCreator('CRUD_DEMO_ITEM');

export const fetchCrudDemoItemList = createActionRoutine<void, CrudDemoItemApiGetResponseData[]>('FETCH_ITEMS');
export const fetchCrudDemoItem = createActionRoutine<string, CrudDemoItemApiGetResponseData>('FETCH_ITEM');
export const addCrudDemoItem = createActionRoutine<CrudDemoItemApiPostRequestData, CrudDemoItemApiPostResponseData>(
  'ADD_ITEM'
);
export const updateCrudDemoItem = createPromiseAction<CrudDemoItemApiPutRequestData, CrudDemoItemApiPostResponseData>(
  'UPDATE_ITEM'
);
export const deleteCrudDemoItem = createActionRoutine<string, void>('DELETE_ITEM');
