import * as faker from 'faker';
import { mergeDeepRight } from 'ramda';
import {
  StripePaymentMethod,
  StripePaymentMethodCardBrand,
  StripePaymentMethodType,
} from '../../shared/services/api/stripe/paymentMethod';
import { TransactionHistoryEntry } from '../../shared/services/api/stripe/history/types';
import { DeepMergeFactory } from './types';

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

export const transactionHistoryEntryFactory: DeepMergeFactory<TransactionHistoryEntry> = (overrides = {}) =>
  mergeDeepRight(
    {
      id: faker.random.uuid(),
      date: new Date(2020, 5, 5).toString(),
      amount: faker.random.number({ min: 100, max: 1000 }),
      paymentMethod: paymentMethodFactory(),
    },
    overrides
  );
