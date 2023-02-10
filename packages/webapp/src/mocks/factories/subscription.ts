import { OperationDescriptor } from 'react-relay/hooks';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import SubscriptionActivePlanDetailsQuery from '../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import subscriptionPlansAllQueryGraphql from '../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { SUBSCRIPTION_PLANS_ALL_QUERY } from '../../routes/finances/editSubscription/subscriptionPlans/subscriptionPlans.graphql';
import { STRIPE_SUBSCRIPTION_QUERY } from '../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { SUBSCRIPTION_ACTIVE_PLAN_DETAILS_QUERY } from '../../shared/hooks/finances/useSubscriptionPlanDetails/useSubscriptionPlanDetails.graphql';
import {
  Subscription,
  SubscriptionPhase,
  SubscriptionPlan,
  SubscriptionPlanName,
} from '../../shared/services/api/subscription/types';
import {
  composeMockedListQueryResult,
  composeMockedQueryResult,
  connectionFromArray,
  makeId,
} from '../../tests/utils/fixtures';
import { createDeepFactory } from './factoryCreators';
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
    currentPeriodStart: new Date(2020, 5, 5).toString(),
    currentPeriodEnd: new Date(2025, 10, 10).toString(),
    trialStart: null,
    trialEnd: null,
  },
}));

export const fillSubscriptionScheduleQuery = (
  relayEnvironment?: RelayMockEnvironment,
  subscription: Partial<Subscription>
) => {
  if (relayEnvironment) {
    relayEnvironment.mock.queueOperationResolver((operation) => {
      return MockPayloadGenerator.generate(operation, {
        SubscriptionScheduleType: (context, generateId) => ({
          ...subscription,
        }),
      });
    });
    relayEnvironment.mock.queuePendingOperation(SubscriptionActivePlanDetailsQuery, {});
  }

  const defaultPaymentMethod = subscription.defaultPaymentMethod || {};

  return composeMockedQueryResult(STRIPE_SUBSCRIPTION_QUERY, {
    data: {
      activeSubscription: subscription,
      allPaymentMethods: [defaultPaymentMethod],
    },
  });
};

export const fillSubscriptionScheduleQueryWithPhases = (
  relayEnvironment?: RelayMockEnvironment,
  phases: SubscriptionPhase[]
) => {
  return fillSubscriptionScheduleQuery(
    relayEnvironment,
    subscriptionFactory({
      defaultPaymentMethod: paymentMethodFactory({
        billingDetails: { name: 'Owner' },
        card: { last4: '1234' },
      }),
      phases,
    })
  );
};

export const fillSubscriptionPlansAllQuery = (env: RelayMockEnvironment, data: SubscriptionPlan[] = []) => {
  if (env) {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        SubscriptionPlanConnection: () => connectionFromArray(data),
      })
    );
    env.mock.queuePendingOperation(subscriptionPlansAllQueryGraphql, {});
  }

  return composeMockedListQueryResult(SUBSCRIPTION_PLANS_ALL_QUERY, 'allSubscriptionPlans', 'SubscriptionPlanType', {
    data,
  });
};

// Apollo Mocks
export const fillAllPaymentsMethodsQuery = (data: Partial<Subscription>[]) =>
  composeMockedListQueryResult(STRIPE_SUBSCRIPTION_QUERY, 'allPaymentMethods', 'StripePaymentMethodType', {
    data,
  });

export const fillActivePlanDetailsQuery = (data: Partial<Subscription>) =>
  composeMockedQueryResult(SUBSCRIPTION_ACTIVE_PLAN_DETAILS_QUERY, {
    data: {
      activeSubscription: data,
    },
  });
