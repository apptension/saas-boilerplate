import { store } from '../../../mocks/store';
import { reducer } from '../users.reducer';

describe('Users: reducer', () => {
  const defaultState = store.users;

  it('should return initial state', () => {
    expect(reducer(undefined, { type: 'unknown-action' })).toEqual(defaultState);
  });

  it('should return state on unknown action', () => {
    expect(reducer(defaultState, { type: 'unknown-action' })).toEqual(defaultState);
  });
});
