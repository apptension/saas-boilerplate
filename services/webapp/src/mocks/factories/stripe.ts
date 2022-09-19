import { createMockEnvironment, MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';
import {
  StripePaymentMethod,
  StripePaymentMethodCardBrand,
  StripePaymentMethodType,
} from '../../shared/services/api/stripe/paymentMethod';
import {
  TransactionHistoryEntry,
  TransactionHistoryEntryInvoice,
} from '../../shared/services/api/stripe/history/types';
import { makeId } from '../../tests/utils/fixtures';
import { DeepPartial } from '../../shared/utils/types';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
import { connectionFromArray } from '../../shared/utils/testUtils';
import StripeAllPaymentMethodsQueryGraphql from '../../modules/stripe/__generated__/stripeAllPaymentMethodsQuery.graphql';
import { createDeepFactory, createFactory } from './factoryCreators';
import { subscriptionPlanFactory } from './subscription';

export const paymentMethodFactory = createDeepFactory<StripePaymentMethod>(() => ({
  id: makeId(32),
  type: StripePaymentMethodType.Card,
  billingDetails: {
    name: 'MockLastName',
  },
  card: {
    id: makeId(32),
    last4: '9999',
    brand: StripePaymentMethodCardBrand.Visa,
    country: 'PL',
    expMonth: 10,
    expYear: 30,
    fingerprint: makeId(10),
    funding: 'credit',
    generatedFrom: '',
    threeDSecureUsage: {
      supported: true,
    },
    checks: {
      addressLine1Check: 'pass',
      addressPostalCodeCheck: 'pass',
      cvcCheck: 'pass',
    },
  },
}));

export const transactionHistoryEntryInvoiceFactory = createFactory<TransactionHistoryEntryInvoice>(() => ({
  id: makeId(32),
  items: [
    {
      id: makeId(32),
      price: subscriptionPlanFactory(),
    },
  ],
}));

export const transactionHistoryEntryFactory = createFactory<TransactionHistoryEntry>(() => ({
  id: makeId(32),
  created: new Date(2020, 5, 5).toString(),
  amount: 500,
  paymentMethod: paymentMethodFactory(),
  billingDetails: {
    name: 'MockLastName',
  },
  invoice: null,
}));

export const generateRelayEnvironmentWithPaymentMethods = (
  paymentMethods: DeepPartial<StripePaymentMethod>[],
  relayEnv?: RelayMockEnvironment
) => {
  const env = relayEnv ?? createMockEnvironment();
  if (!relayEnv) {
    fillCommonQueryWithUser(env);
  }
  env.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      PaymentMethodConnection: () => connectionFromArray(paymentMethods),
    })
  );
  env.mock.queuePendingOperation(StripeAllPaymentMethodsQueryGraphql, {});
  return env;
};
