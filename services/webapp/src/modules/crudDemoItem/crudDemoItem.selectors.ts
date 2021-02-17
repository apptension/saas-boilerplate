import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../config/reducers';

export const selectCrudDemoItemDomain = (state: GlobalState) => state.crudDemoItem;

export const selectCrudDemoItemList = createSelector(selectCrudDemoItemDomain, (state) => state.items);
