import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';

import {
  Subscription,
  SubscriptionPhase,
  SubscriptionPlan,
  SubscriptionPlanName,
} from '../../shared/services/api/subscription/types';
import SubscriptionActivePlanDetailsQuery from '../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import { connectionFromArray, makeId } from '../../tests/utils/fixtures';
import subscriptionPlansAllQueryGraphql from '../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
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
  phases: [subscriptionPhaseFactory()],
  canActivateTrial: false,
  defaultPaymentMethod: paymentMethodFactory(),
  subscription: {
    id: makeId(32),
    currentPeriodStart: new Date(2020, 5, 5).toString(),
    currentPeriodEnd: new Date(2025, 10, 10).toString(),
    trialStart: null,
    trialEnd: null,
  },
}));

export const fillSubscriptionScheduleQuery = (
  relayEnvironment: RelayMockEnvironment,
  subscription: Partial<Subscription>
) => {
  relayEnvironment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, {
      SubscriptionScheduleType: (context, generateId) => ({
        ...subscription,
      }),
    });
  });
  relayEnvironment.mock.queuePendingOperation(SubscriptionActivePlanDetailsQuery, {});
};

export const fillSubscriptionScheduleQueryWithPhases = (
  relayEnvironment: RelayMockEnvironment,
  phases: SubscriptionPhase[]
) => {
  fillSubscriptionScheduleQuery(
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
  env.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      SubscriptionPlanConnection: () => connectionFromArray(data),
    })
  );
  env.mock.queuePendingOperation(subscriptionPlansAllQueryGraphql, {});
};
