import { faker } from '@faker-js/faker';
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
  id: faker.datatype.uuid(),
  type: faker.helpers.arrayElement([StripePaymentMethodType.Card]),
  billingDetails: {
    name: faker.name.lastName(),
  },
  card: {
    id: faker.datatype.uuid(),
    last4: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
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
  id: faker.datatype.uuid(),
  items: [
    {
      id: faker.datatype.uuid(),
      price: subscriptionPlanFactory(),
    },
  ],
}));

export const transactionHistoryEntryFactory = createFactory<TransactionHistoryEntry>(() => ({
  id: faker.datatype.uuid(),
  created: new Date(2020, 5, 5).toString(),
  amount: faker.datatype.number({ min: 100, max: 1000 }),
  paymentMethodDetails: paymentMethodFactory(),
  billingDetails: {
    name: faker.name.lastName(),
  },
  invoice: null,
}));
