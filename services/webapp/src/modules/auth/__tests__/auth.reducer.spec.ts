import { reducer, INITIAL_STATE as defaultState } from '../auth.reducer';
import { authActions } from '../index';
import { userProfileFactory } from '../../../mocks/factories';

describe('Auth: reducer', () => {
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

  describe('fetchProfileSuccess', () => {
    const profile = userProfileFactory();

    it('should update user profile', () => {
      const action = authActions.fetchProfileSuccess(profile);
      const resultState = reducer(defaultState, action);
      expect(resultState.profile).toEqual(profile);
    });

    it('should set isLoggedIn to true', () => {
      const action = authActions.fetchProfileSuccess(profile);
      const resultState = reducer(defaultState, action);
      expect(resultState.isLoggedIn).toBe(true);
    });
  });
});
