import { expectSaga } from 'redux-saga-test-plan';
import { watchSnackbar } from '../snackbar.sagas';
import { snackbarActions } from '..';
import { prepareState } from '../../../mocks/store';

const mockDelay = jest.fn();
jest.mock('redux-saga/effects', () => {
  return {
    ...jest.requireActual<NodeModule>('redux-saga/effects'),
    delay: (...args: any) => mockDelay(...args),
  };
});

describe('Snackbar: sagas', () => {
  const defaultState = prepareState((state) => {
    state.snackbar.lastMessageId = 100;
  });

  describe('showMessage', () => {
    it('should show message, wait 5s and hide it', async () => {
      await expectSaga(watchSnackbar)
        .withState(defaultState)
        .put(snackbarActions.showMessage.resolved({ id: 101, text: 'Example message' }))
        .put(snackbarActions.hideMessage(101))
        .dispatch(snackbarActions.showMessage('Example message'))
        .silentRun();

      expect(mockDelay).toHaveBeenCalledWith(5000);
    });
  });
});
