import { reducer, INITIAL_STATE as defaultState } from '../config.reducer';
import { configActions } from '../index';
import { appConfigFactory } from '../../../mocks/factories';

describe('Config: reducer', () => {
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

  describe('setAppConfig', () => {
    it('should set app config data', () => {
      const contentfulConfig = { privacyPolicy: 'privacy', termsAndConditions: 'terms' };
      const config = appConfigFactory({ contentfulConfig });
      const action = configActions.setAppConfig(contentfulConfig);
      const resultState = reducer(defaultState, action);
      expect(resultState).toEqual(config);
    });
  });
});
