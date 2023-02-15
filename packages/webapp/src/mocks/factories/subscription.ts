import { OperationDescriptor } from 'react-relay/hooks';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import SubscriptionActivePlanDetailsQuery from '../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import subscriptionPlansAllQueryGraphql from '../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { subscriptionPlansAllQuery } from '../../routes/finances/editSubscription/subscriptionPlans/subscriptionPlans.graphql';
import { stripeSubscriptionQuery } from '../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { subscriptionActivePlanDetailsQuery } from '../../shared/hooks/finances/useSubscriptionPlanDetails/useSubscriptionPlanDetails.graphql';
import { StripePaymentMethod } from '../../shared/services/api/stripe/paymentMethod';
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
  mapRelayEdges,
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
  subscription: Partial<Subscription>,
  paymentMethods?: StripePaymentMethod[]
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

  const defaultPaymentMethod = subscription.defaultPaymentMethod || ({} as StripePaymentMethod);
  if (!paymentMethods) {
    paymentMethods = [defaultPaymentMethod];
  }

  return composeMockedQueryResult(stripeSubscriptionQuery, {
    data: {
      activeSubscription: { ...subscription, __typename: 'SubscriptionScheduleType' },
      allPaymentMethods: mapRelayEdges(paymentMethods, 'StripePaymentMethodType'),
    },
  });
};

export const fillSubscriptionScheduleQueryWithPhases = (
  relayEnvironment?: RelayMockEnvironment,
  phases: SubscriptionPhase[],
  paymentMethods?: StripePaymentMethod[]
) => {
  return fillSubscriptionScheduleQuery(
    relayEnvironment,
    subscriptionFactory({
      defaultPaymentMethod: paymentMethodFactory({
        billingDetails: { name: 'Owner' },
        card: { last4: '1234' },
      }),
      phases,
    }),
    paymentMethods
  );
};

export const fillSubscriptionPlansAllQuery = (env?: RelayMockEnvironment, data: SubscriptionPlan[] = []) => {
  if (env) {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        SubscriptionPlanConnection: () => connectionFromArray(data),
      })
    );
    env.mock.queuePendingOperation(subscriptionPlansAllQueryGraphql, {});
  }

  return composeMockedListQueryResult(subscriptionPlansAllQuery, 'allSubscriptionPlans', 'SubscriptionPlanType', {
    data,
  });
};

// Apollo Mocks
export const fillAllPaymentsMethodsQuery = (data: Partial<Subscription>[]) =>
  composeMockedListQueryResult(stripeSubscriptionQuery, 'allPaymentMethods', 'StripePaymentMethodType', {
    data,
  });

export const fillActivePlanDetailsQuery = (data: Partial<Subscription>) =>
  composeMockedQueryResult(subscriptionActivePlanDetailsQuery, {
    data: {
      activeSubscription: data,
    },
  });
