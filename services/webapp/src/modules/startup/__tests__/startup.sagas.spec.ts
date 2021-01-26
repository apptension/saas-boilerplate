import { expectSaga } from 'redux-saga-test-plan';

import { watchStartup } from '../startup.sagas';
import { startupActions } from '..';

describe('Startup: sagas', () => {
  const defaultState = {};

  it('should run successfully', async () => {
    await expectSaga(watchStartup)
      .withState(defaultState)
      .dispatch(startupActions.startup())
      .silentRun();
  });
});
