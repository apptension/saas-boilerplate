import { reducer, INITIAL_STATE as defaultState } from '../auth.reducer';
import { authActions } from '../index';
import { loggedInAuthFactory, userProfileFactory } from '../../../mocks/factories';
import { prepareState } from '../../../mocks/store';

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

  describe('fetchProfile.resolve', () => {
    const profile = userProfileFactory();

    it('should update user profile', () => {
      const action = authActions.fetchProfile.resolved(profile);
      const resultState = reducer(defaultState, action);
      expect(resultState.profile).toEqual(profile);
    });

    it('should set isLoggedIn to true', () => {
      const action = authActions.fetchProfile.resolved(profile);
      const resultState = reducer(defaultState, action);
      expect(resultState.isLoggedIn).toBe(true);
    });
  });

  describe('updateProfile.resolve', () => {
    const profile = userProfileFactory();

    it('should update user profile', () => {
      const action = authActions.fetchProfile.resolved(profile);
      const resultState = reducer(defaultState, action);
      expect(resultState.profile).toEqual(profile);
    });
  });

  describe('logout.resolve', () => {
    const loggedInState = prepareState((state) => {
      state.auth = loggedInAuthFactory();
    }).auth;

    describe('is resolved without error', () => {
      it('should reset user profile', () => {
        const action = authActions.logout.resolved({ isError: false });
        const resultState = reducer(loggedInState, action);
        expect(resultState.profile).toBeUndefined();
      });

      it('should set isLoggedIn to false', () => {
        const action = authActions.logout.resolved({ isError: false });
        const resultState = reducer(loggedInState, action);
        expect(resultState.isLoggedIn).toBe(false);
      });
    });

    describe('is resolved with error', () => {
      it('should not reset user profile', () => {
        const action = authActions.logout.resolved({ isError: true });
        const resultState = reducer(loggedInState, action);
        expect(resultState.profile).toEqual(loggedInState.profile);
      });
    });
  });
});
