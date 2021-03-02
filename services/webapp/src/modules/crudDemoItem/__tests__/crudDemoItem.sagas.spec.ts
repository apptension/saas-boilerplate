import { expectSaga } from 'redux-saga-test-plan';

import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { watchCrudDemoItem } from '../crudDemoItem.sagas';
import { crudDemoItemActions } from '..';
import { crudDemoItemFactory } from '../../../mocks/factories';
import { server } from '../../../mocks/server';
import {
  mockAddCrudDemoItem,
  mockGetCrudDemoItem,
  mockGetCrudDemoItemList,
  mockUpdateCrudDemoItem,
} from '../../../mocks/server/handlers';
import { prepareState } from '../../../mocks/store';
import { snackbarActions } from '../../snackbar';

const items = [crudDemoItemFactory(), crudDemoItemFactory(), crudDemoItemFactory()];

describe('CrudDemoItem: sagas', () => {
  const defaultState = prepareState((state) => state);

  describe('fetchCrudDemoItem', () => {
    it('should resolve action with fetched items', async () => {
      server.use(mockGetCrudDemoItemList(items));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(crudDemoItemActions.fetchCrudDemoItemList.resolved(items))
        .dispatch(crudDemoItemActions.fetchCrudDemoItemList())
        .silentRun();
    });
  });

  describe('fetchCrudDemoItem', () => {
    it('should resolve action with fetched item', async () => {
      const item = items[0];
      server.use(mockGetCrudDemoItem(item.id, item));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(crudDemoItemActions.fetchCrudDemoItem.resolved(item))
        .dispatch(crudDemoItemActions.fetchCrudDemoItem(item.id))
        .silentRun();
    });
  });

  describe('addCrudDemoItem', () => {
    it('should resolve action when completed', async () => {
      const item = items[0];
      server.use(mockAddCrudDemoItem({ isError: false, ...item }));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(crudDemoItemActions.addCrudDemoItem.resolved({ isError: false, ...item }))
        .dispatch(crudDemoItemActions.addCrudDemoItem(item))
        .silentRun();
    });

    it('should resolve action with error when failed with BAD_REQUEST', async () => {
      const item = items[0];
      server.use(mockAddCrudDemoItem({ isError: true, nonFieldErrors: ['error'] }, BAD_REQUEST));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(crudDemoItemActions.addCrudDemoItem.resolved({ isError: true, nonFieldErrors: ['error'] }))
        .dispatch(crudDemoItemActions.addCrudDemoItem(item))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      const item = items[0];
      server.use(mockAddCrudDemoItem({ isError: true }, INTERNAL_SERVER_ERROR));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
        .dispatch(crudDemoItemActions.addCrudDemoItem(item))
        .silentRun();
    });
  });

  describe('updateCrudDemoItem', () => {
    it('should resolve action when completed', async () => {
      const item = items[0];
      server.use(mockUpdateCrudDemoItem(item.id, { isError: false, ...item }));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(crudDemoItemActions.updateCrudDemoItem.resolved({ isError: false, ...item }))
        .dispatch(crudDemoItemActions.updateCrudDemoItem(item))
        .silentRun();
    });

    it('should resolve action with error when failed with BAD_REQUEST', async () => {
      const item = items[0];
      server.use(mockUpdateCrudDemoItem(item.id, { isError: true, nonFieldErrors: ['error'] }, BAD_REQUEST));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(crudDemoItemActions.updateCrudDemoItem.resolved({ isError: true, nonFieldErrors: ['error'] }))
        .dispatch(crudDemoItemActions.updateCrudDemoItem(item))
        .silentRun();
    });

    it('should prompt snackbar error if call completes with unexpected error', async () => {
      const item = items[0];
      server.use(mockUpdateCrudDemoItem(item.id, { isError: true }, INTERNAL_SERVER_ERROR));

      await expectSaga(watchCrudDemoItem)
        .withState(defaultState)
        .put(snackbarActions.showMessage(null))
        .dispatch(crudDemoItemActions.updateCrudDemoItem(item))
        .silentRun();
    });
  });
});
