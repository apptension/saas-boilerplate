import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import { append, equals, pipe, reject, uniq } from 'ramda';
import { FavoriteDemoItemsApiGetResponseData } from '../../shared/services/api/demoItems/types';
import * as demoItemsActions from './demoItems.actions';
import { DemoItemsState, SetFavoritePayload } from './demoItems.types';

export const INITIAL_STATE: DemoItemsState = {
  favorites: [],
};

const handleSetFavorite = (
  state: DemoItemsState,
  { payload: { isFavorite, id } }: PayloadAction<SetFavoritePayload>
) => {
  const addItem = pipe(append(id), uniq);
  const removeItem = reject(equals(id)) as (items: string[]) => string[];

  state.favorites = (isFavorite ? addItem : removeItem)(state.favorites);
};

const handleFetchFavoritesResolved = (
  state: DemoItemsState,
  { payload }: PayloadAction<FavoriteDemoItemsApiGetResponseData>
) => {
  state.favorites = payload;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(demoItemsActions.setFavorite, handleSetFavorite);
  builder.addCase(demoItemsActions.fetchFavoriteDemoItems.resolved, handleFetchFavoritesResolved);
});
