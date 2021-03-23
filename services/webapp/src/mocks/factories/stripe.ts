import * as faker from 'faker';
import { mergeDeepRight } from 'ramda';
import {
  StripePaymentMethod,
  StripePaymentMethodCardBrand,
  StripePaymentMethodType,
} from '../../shared/services/api/stripe/paymentMethod';
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
