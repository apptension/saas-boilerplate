import { reducer, INITIAL_STATE as defaultState } from '../startup.reducer';

describe('Startup: redux', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, { type: 'unknown-action' })).toEqual(defaultState);
  });

  it('should return state on unknown action', () => {
    expect(reducer(defaultState, { type: 'unknown-action' })).toEqual(defaultState);
  });
});
