import { reducer, INITIAL_STATE as defaultState } from '../startup.reducer';
import { startupActions } from '../index';

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
});
