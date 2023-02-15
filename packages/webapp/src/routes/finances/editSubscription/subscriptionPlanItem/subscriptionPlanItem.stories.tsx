import { useQuery } from '@apollo/client';
import { Story } from '@storybook/react';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import {
  currentUserFactory,
  fillSubscriptionPlansAllQuery,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { mapConnection } from '../../../../shared/utils/graphql';
import { withProviders } from '../../../../shared/utils/storybook';
import { createMockRouterProps } from '../../../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { useActiveSubscriptionDetails } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { subscriptionPlansAllQuery } from '../subscriptionPlans/subscriptionPlans.graphql';
import { SubscriptionPlanItem } from './subscriptionPlanItem.component';

const routePath = ['subscriptions', 'index'];

const defaultProvidersOptions = {
  routerProps: createMockRouterProps(routePath),
};

const Wrapper = () => {
  const { data, loading } = useQuery(subscriptionPlansAllQuery);
  const { activeSubscription } = useActiveSubscriptionDetails();

  return (
    <Suspense fallback="Loading...">
      {mapConnection(
        (plan) => (
          <SubscriptionPlanItem
            plan={plan}
            onSelect={console.log}
            activeSubscription={activeSubscription}
            key={plan.id}
            loading={loading}
          />
        ),
        data?.allSubscriptionPlans
      )}
    </Suspense>
  );
};

const Template: Story = () => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route path={RoutesConfig.getLocalePath(routePath)} element={<Wrapper />} />
      </Route>
    </Routes>
  );
};

const freePlan = subscriptionPlanFactory();
freePlan.product.name = SubscriptionPlanName.FREE;

const monthlyPlan = subscriptionPlanFactory();
monthlyPlan.product.name = SubscriptionPlanName.MONTHLY;

export default {
  title: 'Shared/Subscriptions/SubscriptionPlanItem',
  component: SubscriptionPlanItem,
};

export const Free = Template.bind({});
Free.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    apolloMocks: () => [
      fillCommonQueryWithUser(undefined, currentUserFactory()),
      fillSubscriptionPlansAllQuery(undefined, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }),
      ]),
      fillSubscriptionScheduleQueryWithPhases(undefined, [
        subscriptionPhaseFactory({
          item: { price: monthlyPlan },
        }),
      ]),
    ],
  }),
];

export const ActiveFree = Template.bind({});
ActiveFree.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    apolloMocks: () => [
      fillCommonQueryWithUser(undefined, currentUserFactory()),
      fillSubscriptionPlansAllQuery(undefined, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }),
      ]),
      fillSubscriptionScheduleQueryWithPhases(undefined, [
        subscriptionPhaseFactory({
          item: { price: freePlan },
        }),
      ]),
    ],
  }),
];

export const Paid = Template.bind({});
Paid.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    apolloMocks: () => [
      fillCommonQueryWithUser(undefined, currentUserFactory()),
      fillSubscriptionPlansAllQuery(undefined, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.MONTHLY } }),
      ]),
      fillSubscriptionScheduleQueryWithPhases(undefined, [
        subscriptionPhaseFactory({
          item: { price: freePlan },
        }),
      ]),
    ],
  }),
];

export const ActivePaid = Template.bind({});
ActivePaid.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    apolloMocks: () => [
      fillCommonQueryWithUser(undefined, currentUserFactory()),
      fillSubscriptionPlansAllQuery(undefined, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.MONTHLY } }),
      ]),
      fillSubscriptionScheduleQueryWithPhases(undefined, [
        subscriptionPhaseFactory({
          item: { price: monthlyPlan },
        }),
      ]),
    ],
  }),
];

export const WithTrialEligible = Template.bind({});
WithTrialEligible.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    apolloMocks: () => [
      fillCommonQueryWithUser(undefined, currentUserFactory()),
      fillSubscriptionPlansAllQuery(undefined, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.MONTHLY } }),
      ]),
      fillSubscriptionScheduleQuery(
        undefined,
        subscriptionFactory({
          canActivateTrial: true,
          phases: [
            subscriptionPhaseFactory({
              item: { price: monthlyPlan },
            }),
          ],
        })
      ),
    ],
  }),
];
