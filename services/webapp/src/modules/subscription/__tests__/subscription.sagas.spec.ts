import { expectSaga } from 'redux-saga-test-plan';

import { watchSubscription } from '../subscription.sagas';
import { subscriptionActions } from '..';

describe('Subscription: sagas', () => {
  const defaultState = {};

  it('should implement a test', async () => {
    await expectSaga(watchSubscription)
      .withState(defaultState)
      .put(subscriptionActions.fetchActiveSubscription.resolved([]))
      .dispatch(subscriptionActions.fetchActiveSubscription())
      .silentRun();
  });
});
