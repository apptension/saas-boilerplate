import { times } from 'ramda';

import { prepareState } from '../../../mocks/store';
import { userFactory } from '../../../mocks/factories';
import * as selectors from '../users.selectors';

describe('Users: selectors', () => {
  const defaultState = prepareState((state) => {
    state.startup = {};
  });

  describe('selectUsersDomain', () => {
    it('should select a domain', () => {
      expect(selectors.selectUsersDomain(defaultState)).toEqual(defaultState.users);
    });
  });

  describe('selectUsers', () => {
    it('should select users', () => {
      const state = {
        ...defaultState,
        users: {
          users: times(() => userFactory(), 3),
        },
      };
      expect(selectors.selectUsers(state)).toEqual(state.users.users);
    });
  });
});
