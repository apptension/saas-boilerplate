import { expectSaga } from 'redux-saga-test-plan';

import { watchConfig } from '../config.sagas';
import { configActions } from '..';
import { startupActions } from '../../startup';
import { client } from '../../../shared/services/contentful';

describe('Config: sagas', () => {
  const mockAppConfig = jest.spyOn(client, 'appConfig');

  beforeEach(() => {
    mockAppConfig.mockClear();
  });

  const defaultState = {};
  it('should set app config returned from contentful', async () => {
    const config = { termsAndConditions: 'terms', privacyPolicy: 'privacy' };

    mockAppConfig.mockResolvedValue({
      appConfigCollection: { items: [config] },
    });

    await expectSaga(watchConfig)
      .withState(defaultState)
      .put(configActions.setAppConfig(config))
      .dispatch(startupActions.startup())
      .silentRun();
  });
});
