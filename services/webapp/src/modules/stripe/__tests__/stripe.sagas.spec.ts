import { expectSaga } from 'redux-saga-test-plan';

import { times } from 'ramda';
import { mockGetStripePaymentMethods } from '../../../mocks/server/handlers/stripe';
import { server } from '../../../mocks/server';
import { watchStripe } from '../stripe.sagas';
import { stripeActions } from '..';
import { paymentMethodFactory } from '../../../mocks/factories/stripe';

describe('Stripe: sagas', () => {
  const defaultState = {};

  it('should implement a test', async () => {
    const paymentMethods = times(() => paymentMethodFactory(), 3);

    server.use(mockGetStripePaymentMethods(paymentMethods));
    await expectSaga(watchStripe)
      .withState(defaultState)
      .put(stripeActions.fetchStripePaymentMethods.resolved(paymentMethods))
      .dispatch(stripeActions.fetchStripePaymentMethods())
      .silentRun();
  });
});
