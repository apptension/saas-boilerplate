import { reducer, INITIAL_STATE as defaultState } from '../subscription.reducer';
import { authActions } from '../../auth';
import { prepareState } from '../../../mocks/store';
import { subscriptionFactory } from '../../../mocks/factories';

describe('Subscription: reducer', () => {
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
    it('should reset active subscription status', () => {
      const action = authActions.resetProfile();
      const initialState = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory();
      }).subscription;
      const resultState = reducer(initialState, action);
      expect(resultState).toEqual({
        ...initialState,
        activeSubscription: null,
      });
    });
  });
});
