import * as faker from 'faker';

import { mergeDeepRight } from 'ramda';
import { Subscription, SubscriptionPlanName } from '../../shared/services/api/subscription/types';
import { DeepMergeFactory } from './types';
import { paymentMethodFactory } from './stripe';

export const subscriptionFactory: DeepMergeFactory<Subscription> = (overrides = {}) =>
  mergeDeepRight(
    {
      id: faker.random.uuid(),
      currentPeriodStart: new Date(2020, 5, 5).toString(),
      currentPeriodEnd: new Date(2025, 10, 10).toString(),
      defaultPaymentMethod: paymentMethodFactory(),
      item: {
        id: faker.random.uuid(),
        price: {
          id: faker.random.uuid(),
          product: {
            id: faker.random.uuid(),
            name: faker.random.arrayElement([
              SubscriptionPlanName.FREE,
              SubscriptionPlanName.MONTHLY,
              SubscriptionPlanName.YEARLY,
            ]),
          },
          unitAmount: faker.random.number(10),
        },
        quantity: faker.random.number(10),
      },
    },
    overrides
  );
