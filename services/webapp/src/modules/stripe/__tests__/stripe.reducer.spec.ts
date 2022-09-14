import { reducer, INITIAL_STATE as defaultState } from '../stripe.reducer';
import { authActions } from '../../auth';
import { prepareState } from '../../../mocks/store';
import { transactionHistoryEntryFactory } from '../../../mocks/factories';

describe('Stripe: reducer', () => {
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

  describe('authActions.resetProfile', () => {
    it('should reset transaction history and payment methods', () => {
      const action = authActions.resetProfile();
      const initialState = prepareState((state) => {
        state.stripe.transactionHistory = [transactionHistoryEntryFactory()];
      }).stripe;

      const resultState = reducer(initialState, action);
      expect(resultState).toEqual({
        ...initialState,
        transactionHistory: [],
      });
    });
  });
});
