import { StripePaymentMethod } from '@sb/webapp-api-client/api/stripe/paymentMethod';
import { Subscription, SubscriptionPhase, SubscriptionPlan } from '@sb/webapp-api-client/api/subscription';
import { paymentMethodFactory, subscriptionFactory } from '@sb/webapp-api-client/tests/factories';
import {
  composeMockedListQueryResult,
  composeMockedQueryResult,
  mapRelayEdges,
} from '@sb/webapp-api-client/tests/utils';

import { stripeSubscriptionQuery } from '../../components/stripe';
import { subscriptionActivePlanDetailsQuery } from '../../hooks';
import { subscriptionPlansAllQuery } from '../../routes/editSubscription/subscriptionPlans';

export const fillSubscriptionScheduleQuery = (
  subscription: Partial<Subscription>,
  paymentMethods?: StripePaymentMethod[],
  tenantId = 'tenantId'
) => {
  const defaultPaymentMethod = subscription.defaultPaymentMethod || ({} as StripePaymentMethod);
  if (!paymentMethods) {
    paymentMethods = [defaultPaymentMethod];
  }

  return composeMockedQueryResult(stripeSubscriptionQuery, {
    data: {
      activeSubscription: { ...subscription, __typename: 'SubscriptionScheduleType' },
      allPaymentMethods: mapRelayEdges(paymentMethods, 'StripePaymentMethodType'),
    },
    variables: { tenantId },
  });
};

export const fillSubscriptionScheduleQueryWithPhases = (
  phases: SubscriptionPhase[],
  paymentMethods?: StripePaymentMethod[],
  tenantId = 'tenantId'
) => {
  return fillSubscriptionScheduleQuery(
    subscriptionFactory({
      defaultPaymentMethod: paymentMethodFactory({
        billingDetails: { name: 'Owner' },
        card: { last4: '1234' },
      }),
      phases,
    }),
    paymentMethods,
    tenantId
  );
};

export const fillSubscriptionPlansAllQuery = (data: SubscriptionPlan[] = []) => {
  return composeMockedListQueryResult(subscriptionPlansAllQuery, 'allSubscriptionPlans', 'SubscriptionPlanType', {
    data,
  });
};

// Apollo Mocks
export const fillAllPaymentsMethodsQuery = (data: Partial<Subscription>[], tenantId = 'tenantId') =>
  composeMockedListQueryResult(stripeSubscriptionQuery, 'allPaymentMethods', 'StripePaymentMethodType', {
    data,
    variables: { tenantId },
  });

export const fillActivePlanDetailsQuery = (data: Partial<Subscription>, tenantId = 'tenantId') =>
  composeMockedQueryResult(subscriptionActivePlanDetailsQuery, {
    data: {
      activeSubscription: data,
    },
    variables: { tenantId },
  });
