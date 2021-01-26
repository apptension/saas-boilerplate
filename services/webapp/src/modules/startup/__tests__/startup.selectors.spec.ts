import { selectStartupDomain } from '../startup.selectors';
import { prepareState } from '../../../mocks/store';

describe('Startup: selectors', () => {
  const defaultState = prepareState((state) => {
    state.startup = {};
  });

  describe('selectStartupDomain', () => {
    it('should select a domain', () => {
      expect(selectStartupDomain(defaultState)).toEqual(defaultState.startup);
    });
  });
});
