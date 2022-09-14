import { expectSaga } from 'redux-saga-test-plan';
import { times } from 'ramda';
import { server } from '../../../mocks/server';
import { watchStripe } from '../stripe.sagas';
import { stripeActions } from '..';
import { transactionHistoryEntryFactory } from '../../../mocks/factories';
import { mockListTransactionHistory } from '../../../mocks/server/handlers';

describe('Stripe: sagas', () => {
  const defaultState = {};

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
