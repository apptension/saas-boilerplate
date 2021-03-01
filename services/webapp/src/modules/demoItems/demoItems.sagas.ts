import { all, takeLatest } from 'redux-saga/effects';

import { demoItems } from '../../shared/services/api';
import { handleApiRequest } from '../helpers/handleApiRequest';
import * as demoItemsActions from './demoItems.actions';

export function* watchDemoItems() {
  yield all([
    takeLatest(demoItemsActions.fetchFavoriteDemoItems, handleApiRequest(demoItems.allFavorites)),
    takeLatest(demoItemsActions.setFavorite, handleApiRequest(demoItems.setFavorite)),
  ]);
}
