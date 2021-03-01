import { actionCreator } from '../helpers/actionCreator';
import {
  FavoriteDemoItemApiPostResponseData,
  FavoriteDemoItemsApiGetResponseData,
} from '../../shared/services/api/demoItems/types';
import { SetFavoritePayload } from './demoItems.types';

const { createPromiseAction, createActionRoutine } = actionCreator('DEMO_ITEMS');

export const fetchFavoriteDemoItems = createPromiseAction<void, FavoriteDemoItemsApiGetResponseData>('FETCH_FAVORITES');
export const setFavorite = createActionRoutine<SetFavoritePayload, FavoriteDemoItemApiPostResponseData>('SET_FAVORITE');
