import { expectSaga } from 'redux-saga-test-plan';
import { watchSubscription } from '../subscription.sagas';
import { subscriptionActions } from '..';
import { subscriptionFactory } from '../../../mocks/factories';
import { server } from '../../../mocks/server';
import { mockGetSubscription } from '../../../mocks/server/handlers/subscription';

const activeSubscription = subscriptionFactory();

describe('Subscription: sagas', () => {
  const defaultState = {};

  it('should fetch active subscription', async () => {
    server.use(mockGetSubscription(activeSubscription));

    await expectSaga(watchSubscription)
      .withState(defaultState)
      .put(subscriptionActions.fetchActiveSubscription.resolved(activeSubscription))
      .dispatch(subscriptionActions.fetchActiveSubscription())
      .silentRun();
  });
});
