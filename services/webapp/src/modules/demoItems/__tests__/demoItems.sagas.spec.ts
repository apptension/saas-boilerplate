import { expectSaga } from 'redux-saga-test-plan';

import { BAD_REQUEST } from 'http-status-codes';
import { watchDemoItems } from '../demoItems.sagas';
import { demoItemsActions } from '..';
import { server } from '../../../mocks/server';
import { mockGetFavoritesDemoItems, mockSetFavoriteDemoItem } from '../../../mocks/server/handlers';

describe('DemoItems: sagas', () => {
  const defaultState = {};

  describe('setFavorite', () => {
    const setFavoritePayload = {
      id: 'item-id',
      isFavorite: true,
    };

    it('should resolve action if call completes successfully', async () => {
      server.use(mockSetFavoriteDemoItem('item-id', { isError: false }));

      await expectSaga(watchDemoItems)
        .withState(defaultState)
        .put(demoItemsActions.setFavorite.resolved({ isError: false }))
        .dispatch(demoItemsActions.setFavorite(setFavoritePayload))
        .silentRun();
    });

    it('should reject action if call completes with error', async () => {
      server.use(mockSetFavoriteDemoItem('item-id', { isError: true }, BAD_REQUEST));

      await expectSaga(watchDemoItems)
        .withState(defaultState)
        .put(demoItemsActions.setFavorite.resolved({ isError: true }))
        .dispatch(demoItemsActions.setFavorite(setFavoritePayload))
        .silentRun();
    });
  });

  describe('fetchFavoriteDemoItems', () => {
    it('should resolve action if call completes successfully', async () => {
      server.use(mockGetFavoritesDemoItems([{ item: 'item-1' }, { item: 'item-2' }]));

      await expectSaga(watchDemoItems)
        .withState(defaultState)
        .put(demoItemsActions.fetchFavoriteDemoItems.resolved([{ item: 'item-1' }, { item: 'item-2' }]))
        .dispatch(demoItemsActions.fetchFavoriteDemoItems())
        .silentRun();
    });
  });
});
