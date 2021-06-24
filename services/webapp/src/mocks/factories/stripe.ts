import * as faker from 'faker';
import {
  StripePaymentMethod,
  StripePaymentMethodCardBrand,
  StripePaymentMethodType,
} from '../../shared/services/api/stripe/paymentMethod';
import {
  TransactionHistoryEntry,
  TransactionHistoryEntryInvoice,
} from '../../shared/services/api/stripe/history/types';
import { createDeepFactory, createFactory } from './factoryCreators';
import { subscriptionPlanFactory } from './subscription';

export const paymentMethodFactory = createDeepFactory<StripePaymentMethod>(() => ({
  id: faker.random.uuid(),
  type: faker.random.arrayElement([StripePaymentMethodType.Card]),
  billingDetails: {
    name: faker.name.lastName(),
  },
  card: {
    id: faker.random.uuid(),
    last4: faker.random.number({ min: 1000, max: 9999 }).toString(),
    brand: StripePaymentMethodCardBrand.Visa,
    country: 'PL',
    expMonth: 10,
    expYear: 30,
    fingerprint: faker.random.alphaNumeric(10),
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
  id: faker.random.uuid(),
  items: [
    {
      id: faker.random.uuid(),
      price: subscriptionPlanFactory(),
    },
  ],
}));

export const transactionHistoryEntryFactory = createFactory<TransactionHistoryEntry>(() => ({
  id: faker.random.uuid(),
  created: new Date(2020, 5, 5).toString(),
  amount: faker.random.number({ min: 100, max: 1000 }),
  paymentMethodDetails: paymentMethodFactory(),
  billingDetails: {
    name: faker.name.lastName(),
  },
  invoice: null,
}));
