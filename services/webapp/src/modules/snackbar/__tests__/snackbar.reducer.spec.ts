import { reducer, INITIAL_STATE as defaultState } from '../snackbar.reducer';
import { snackbarActions } from '../index';
import { prepareState } from '../../../mocks/store';

describe('Snackbar: reducer', () => {
  it('should return initial state', () => {
    const action = { type: 'unknown-action' };
    const resultState = reducer(undefined, action);
    expect(resultState).toEqual(defaultState);
  });

  it('should return state on unknown action', () => {
    const action = { type: 'unknown-action' };
    const resultState = reducer(defaultState, action);
    expect(resultState).toEqual(defaultState);
  });

  describe('showMessage.resolved', () => {
    it('should add new message to the list', () => {
      const addFirstAction = snackbarActions.showMessage({ id: 1, text: 'First message' });
      const addSecondAction = snackbarActions.showMessage({ id: 2, text: 'Second message' });

      let resultState = reducer(defaultState, addFirstAction);
      expect(resultState.messages).toEqual([{ id: 1, text: 'First message' }]);

      resultState = reducer(resultState, addSecondAction);
      expect(resultState.messages).toEqual([
        { id: 1, text: 'First message' },
        { id: 2, text: 'Second message' },
      ]);
    });

    it('should update lastMessageId to match the message id', () => {
      const addFirstAction = snackbarActions.showMessage({ id: 1, text: 'First message' });
      const addSecondAction = snackbarActions.showMessage({ id: 2, text: 'Second message' });

      let resultState = reducer(defaultState, addFirstAction);
      expect(resultState.lastMessageId).toEqual(1);

      resultState = reducer(resultState, addSecondAction);
      expect(resultState.lastMessageId).toEqual(2);
    });
  });

  describe('hideMessage', () => {
    it('should remove message from the list', () => {
      const initialState = prepareState((state) => {
        state.snackbar.messages = [
          { id: 1, text: 'First message' },
          { id: 2, text: 'Second message' },
        ];
      }).snackbar;

      const removeFirstAction = snackbarActions.hideMessage(1);
      const removeSecondAction = snackbarActions.hideMessage(2);

      let resultState = reducer(initialState, removeFirstAction);
      expect(resultState.messages).toEqual([{ id: 2, text: 'Second message' }]);

      resultState = reducer(resultState, removeSecondAction);
      expect(resultState.messages).toEqual([]);
    });
  });
});
