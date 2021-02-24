import { reducer, INITIAL_STATE as defaultState } from '../startup.reducer';
import { startupActions } from '../index';
import { authActions } from '../../auth';

describe('Startup: redux', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: 'unknown-action' })).toEqual(defaultState);
  });

  it('should return state on unknown action', () => {
    expect(reducer(defaultState, { type: 'unknown-action' })).toEqual(defaultState);
  });

  describe('completeProfileStartup', () => {
    it('should set profileStartupCompleted to true', () => {
      expect(reducer(defaultState, startupActions.completeProfileStartup())).toEqual({
        ...defaultState,
        profileStartupCompleted: true,
      });
    });
  });

  describe('logout.resolved', () => {
    it('should set profileStartupCompleted to false', () => {
      const initialState = {
        ...defaultState,
        profileStartupCompleted: true,
      };
      const resultState = reducer(initialState, authActions.logout.resolved());

      expect(initialState.profileStartupCompleted).toEqual(true);
      expect(resultState.profileStartupCompleted).toEqual(false);
    });
  });
});
