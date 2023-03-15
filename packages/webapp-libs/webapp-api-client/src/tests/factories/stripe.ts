import {
  StripePaymentMethod,
  StripePaymentMethodCardBrand,
  StripePaymentMethodType,
  TransactionHistoryEntry,
  TransactionHistoryEntryInvoice,
} from '../../api/stripe';
import { makeId } from '../../tests/utils/fixtures';
import { createDeepFactory, createFactory } from '../utils';
import { subscriptionPlanFactory } from './subscription';

export const paymentMethodFactory = createDeepFactory<StripePaymentMethod>(() => ({
  id: makeId(32),
  type: StripePaymentMethodType.Card,
  billingDetails: {
    name: 'MockLastName',
  },
  pk: 'pk-test-id',
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
  __typename: 'StripePaymentMethodType',
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
