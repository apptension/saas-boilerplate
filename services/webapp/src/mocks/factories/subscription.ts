import * as faker from 'faker';

import { mergeDeepRight } from 'ramda';
import { Subscription, SubscriptionPlan, SubscriptionPlanName } from '../../shared/services/api/subscription/types';
import { DeepMergeFactory } from './types';
import { paymentMethodFactory } from './stripe';

export const subscriptionPlanFactory: DeepMergeFactory<SubscriptionPlan> = (overrides = {}) =>
  mergeDeepRight(
    {
      id: faker.random.uuid(),
      product: {
        id: faker.random.uuid(),
        name: faker.random.arrayElement([
          SubscriptionPlanName.FREE,
          SubscriptionPlanName.MONTHLY,
          SubscriptionPlanName.YEARLY,
        ]),
      },
      unitAmount: faker.random.number({ min: 1000, max: 2500 }),
    },
    overrides
  );

export const subscriptionFactory: DeepMergeFactory<Subscription> = (overrides = {}) =>
  mergeDeepRight(
    {
      id: faker.random.uuid(),
      currentPeriodStart: new Date(2020, 5, 5).toString(),
      currentPeriodEnd: new Date(2025, 10, 10).toString(),
      defaultPaymentMethod: paymentMethodFactory(),
      item: {
        id: faker.random.uuid(),
        price: subscriptionPlanFactory(overrides.item?.price),
        quantity: faker.random.number(10),
      },
    },
    overrides
  );
