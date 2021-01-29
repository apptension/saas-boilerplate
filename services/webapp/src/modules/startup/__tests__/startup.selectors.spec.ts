import { identity } from 'ramda';
import { selectStartupDomain } from '../startup.selectors';
import { prepareState } from '../../../mocks/store';

describe('Startup: selectors', () => {
  const defaultState = prepareState(identity);

  describe('selectStartupDomain', () => {
    it('should select a domain', () => {
      expect(selectStartupDomain(defaultState)).toEqual(defaultState.startup);
    });
  });
});
