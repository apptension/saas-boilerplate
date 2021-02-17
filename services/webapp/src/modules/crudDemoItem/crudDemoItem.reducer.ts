import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import { prop, uniqBy } from 'ramda';
import {
  CrudDemoItemApiGetResponseData,
  CrudDemoItemApiPostResponseData,
} from '../../shared/services/api/crudDemoItem/types';
import * as crudDemoItemActions from './crudDemoItem.actions';
import { CrudDemoItemState } from './crudDemoItem.types';

export const INITIAL_STATE: CrudDemoItemState = {
  items: [],
};

const handleFetchCrudDemoItemListSuccess = (
  state: CrudDemoItemState,
  { payload }: PayloadAction<CrudDemoItemApiGetResponseData[]>
) => {
  state.items = payload;
};

const handleFetchCrudDemoItemSuccess = (
  state: CrudDemoItemState,
  { payload }: PayloadAction<CrudDemoItemApiGetResponseData>
) => {
  state.items.push(payload);
  state.items = uniqBy(prop('id'), state.items);
};

const handleAddCrudDemoItemResolved = (
  state: CrudDemoItemState,
  { payload }: PayloadAction<CrudDemoItemApiPostResponseData>
) => {
  if (!payload.isError) {
    state.items.push(payload);
    state.items = uniqBy(prop('id'), state.items);
  }
};

const handleDeleteCrudDemoItem = (state: CrudDemoItemState, { payload }: PayloadAction<string>) => {
  state.items = state.items.filter((item) => item.id !== payload);
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(crudDemoItemActions.fetchCrudDemoItemList.resolved, handleFetchCrudDemoItemListSuccess);
  builder.addCase(crudDemoItemActions.fetchCrudDemoItem.resolved, handleFetchCrudDemoItemSuccess);
  builder.addCase(crudDemoItemActions.addCrudDemoItem.resolved, handleAddCrudDemoItemResolved);
  builder.addCase(crudDemoItemActions.updateCrudDemoItem.resolved, handleAddCrudDemoItemResolved);
  builder.addCase(crudDemoItemActions.deleteCrudDemoItem, handleDeleteCrudDemoItem);
});
