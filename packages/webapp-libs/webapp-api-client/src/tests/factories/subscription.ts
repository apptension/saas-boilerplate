import { Subscription, SubscriptionPhase, SubscriptionPlan, SubscriptionPlanName } from '../../api/subscription';
import { createDeepFactory, makeId } from '../utils';
import { paymentMethodFactory } from './stripe';

export const subscriptionPlanFactory = createDeepFactory<SubscriptionPlan>(() => ({
  id: makeId(32),
  pk: makeId(32),
  product: {
    id: makeId(32),
    name: SubscriptionPlanName.MONTHLY,
  },
  unitAmount: 1000,
}));

export const subscriptionPhaseFactory = createDeepFactory<SubscriptionPhase>(() => ({
  startDate: new Date(2020, 5, 5).toString(),
  endDate: new Date(2025, 10, 10).toString(),
  trialEnd: null,
  item: {
    id: makeId(32),
    price: subscriptionPlanFactory(),
    quantity: 8,
  },
}));

export const subscriptionFactory = createDeepFactory<Subscription>(() => ({
  id: makeId(32),
  phases: [subscriptionPhaseFactory()],
  canActivateTrial: false,
  defaultPaymentMethod: paymentMethodFactory(),
  __typename: 'typename',
  subscription: {
    id: makeId(32),
    startDate: new Date(2020, 5, 5).toString(),
    currentPeriodStart: new Date(2020, 5, 5).toString(),
    currentPeriodEnd: new Date(2025, 10, 10).toString(),
    trialStart: null,
    trialEnd: null,
  },
}));
