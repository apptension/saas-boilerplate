import { expectSaga } from 'redux-saga-test-plan';
import { times } from 'ramda';
import { mockGetStripePaymentMethods } from '../../../mocks/server/handlers/stripe';
import { server } from '../../../mocks/server';
import { watchStripe } from '../stripe.sagas';
import { stripeActions } from '..';
import { paymentMethodFactory, transactionHistoryEntryFactory } from '../../../mocks/factories';
import { mockListTransactionHistory } from '../../../mocks/server/handlers';

describe('Stripe: sagas', () => {
  const defaultState = {};

  describe('fetchStripePaymentMethods', () => {
    it('should resolve with payment methods', async () => {
      const paymentMethods = times(() => paymentMethodFactory(), 3);

      server.use(mockGetStripePaymentMethods(paymentMethods));
      await expectSaga(watchStripe)
        .withState(defaultState)
        .put(stripeActions.fetchStripePaymentMethods.resolved(paymentMethods))
        .dispatch(stripeActions.fetchStripePaymentMethods())
        .silentRun();
    });
  });

  describe('fetchStripeTransactionHistory', () => {
    it('should resolve with payment methods', async () => {
      const transactionHistory = times(() => transactionHistoryEntryFactory(), 3);

      server.use(mockListTransactionHistory(transactionHistory));
      await expectSaga(watchStripe)
        .withState(defaultState)
        .put(stripeActions.fetchStripeTransactionHistory.resolved(transactionHistory))
        .dispatch(stripeActions.fetchStripeTransactionHistory())
        .silentRun();
    });
  });
});
