import * as faker from 'faker';
import { mergeDeepRight } from 'ramda';
import {
  StripePaymentMethod,
  StripePaymentMethodCardBrand,
  StripePaymentMethodType,
} from '../../shared/services/api/stripe/paymentMethod';
import {
  TransactionHistoryEntry,
  TransactionHistoryEntryInvoice,
} from '../../shared/services/api/stripe/history/types';
import { DeepMergeFactory, Factory } from './types';
import { subscriptionPlanFactory } from './subscription';

export const paymentMethodFactory: DeepMergeFactory<StripePaymentMethod> = (overrides = {}) =>
  mergeDeepRight(
    {
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
    },
    overrides
  );

export const transactionHistoryEntryInvoiceFactory: Factory<TransactionHistoryEntryInvoice> = (overrides = {}) => ({
  id: faker.random.uuid(),
  items: [
    {
      id: faker.random.uuid(),
      product: {
        item: subscriptionPlanFactory(),
        unitAmount: faker.random.number(),
      },
    },
  ],
  ...overrides,
});

export const transactionHistoryEntryFactory: Factory<TransactionHistoryEntry> = (overrides = {}) => ({
  id: faker.random.uuid(),
  created: new Date(2020, 5, 5).toString(),
  amount: faker.random.number({ min: 100, max: 1000 }),
  paymentMethodDetails: paymentMethodFactory(),
  billingDetails: {
    name: faker.name.lastName(),
  },
  invoice: null,
  ...overrides,
});
