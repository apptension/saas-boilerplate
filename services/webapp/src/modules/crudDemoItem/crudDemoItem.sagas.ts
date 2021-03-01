import { all, takeLatest } from 'redux-saga/effects';

import { crudDemoItem } from '../../shared/services/api';
import { handleApiRequest } from '../helpers/handleApiRequest';
import { navigate } from '../helpers/navigate';
import { ROUTES } from '../../routes/app.constants';
import { CrudDemoItemApiPostResponseData } from '../../shared/services/api/crudDemoItem/types';
import * as crudDemoItemActions from './crudDemoItem.actions';

function* addDemoItemResolve(response: CrudDemoItemApiPostResponseData) {
  if (!response.isError) {
    yield navigate(ROUTES.crudDemoItem.list);
  }
}

export function* watchCrudDemoItem() {
  yield all([
    takeLatest(crudDemoItemActions.fetchCrudDemoItemList, handleApiRequest(crudDemoItem.list)),
    takeLatest(crudDemoItemActions.fetchCrudDemoItem, handleApiRequest(crudDemoItem.get)),
    takeLatest(crudDemoItemActions.addCrudDemoItem, handleApiRequest(crudDemoItem.add, addDemoItemResolve)),
    takeLatest(crudDemoItemActions.updateCrudDemoItem, handleApiRequest(crudDemoItem.update)),
    takeLatest(crudDemoItemActions.deleteCrudDemoItem, handleApiRequest(crudDemoItem.remove)),
  ]);
}
