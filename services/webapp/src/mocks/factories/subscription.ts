import * as faker from 'faker';

import { mergeDeepRight } from 'ramda';
import {
  Subscription,
  SubscriptionPhase,
  SubscriptionPlan,
  SubscriptionPlanName,
} from '../../shared/services/api/subscription/types';
import { DeepMergeFactory } from './types';
import { paymentMethodFactory } from './stripe';

export const subscriptionPlanFactory: DeepMergeFactory<SubscriptionPlan> = (overrides = {}) =>
  mergeDeepRight(
    {
      id: faker.random.uuid(),
      product: {
        id: faker.random.uuid(),
        name: SubscriptionPlanName.MONTHLY,
      },
      unitAmount: faker.random.number({ min: 1000, max: 2500 }),
    },
    overrides
  );

export const subscriptionPhaseFactory: DeepMergeFactory<SubscriptionPhase> = (overrides = {}) =>
  mergeDeepRight(
    {
      defaultPaymentMethod: paymentMethodFactory(),
      startDate: new Date(2020, 5, 5).toString(),
      endDate: new Date(2025, 10, 10).toString(),
      trialEnd: null,
      item: {
        id: faker.random.uuid(),
        price: subscriptionPlanFactory(overrides.item?.price),
        quantity: faker.random.number(10),
      },
    },
    overrides
  );

export const subscriptionFactory: DeepMergeFactory<Subscription> = (overrides = {}) => ({
  phases: [subscriptionPhaseFactory()],
  canActivateTrial: false,
  ...overrides,
  subscription: {
    id: faker.random.uuid(),
    currentPeriodStart: new Date(2020, 5, 5).toString(),
    currentPeriodEnd: new Date(2025, 10, 10).toString(),
    trialStart: null,
    trialEnd: null,
    ...(overrides.subscription ?? {}),
  },
});
