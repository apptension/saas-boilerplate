import { Story } from '@storybook/react';
import { useLazyLoadQuery } from 'react-relay';
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';

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
import { withProviders } from '../../../../shared/utils/storybook';

import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { mapConnection } from '../../../../shared/utils/graphql';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { useActiveSubscriptionDetailsQueryRef } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { RoutesConfig } from '../../../../app/config/routes';
import { createMockRouterProps } from '../../../../tests/utils/rendering';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { SubscriptionPlanItem } from './subscriptionPlanItem.component';

const routePath = ['subscriptions', 'index'];

const defaultProvidersOptions = {
  routerProps: createMockRouterProps(routePath),
};

const Wrapper = () => {
  const data = useLazyLoadQuery<subscriptionPlansAllQuery>(subscriptionPlansAllQueryGraphql, {});
  const activeSubscriptionDetailsQueryRefContext = useActiveSubscriptionDetailsQueryRef();

  if (!activeSubscriptionDetailsQueryRefContext || !activeSubscriptionDetailsQueryRefContext.ref) {
    return null;
  }

  return (
    <Suspense fallback="Loading...">
      {mapConnection(
        (plan) => (
          <SubscriptionPlanItem
            plan={plan}
            onSelect={console.log}
            activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref}
            key={plan.id}
          />
        ),
        data.allSubscriptionPlans
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
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
      fillSubscriptionPlansAllQuery(env, [subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } })]);
      fillSubscriptionScheduleQueryWithPhases(env, [
        subscriptionPhaseFactory({
          item: { price: monthlyPlan },
        }),
      ]);
    },
  }),
];

export const ActiveFree = Template.bind({});
ActiveFree.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
      fillSubscriptionPlansAllQuery(env, [subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } })]);
      fillSubscriptionScheduleQueryWithPhases(env, [
        subscriptionPhaseFactory({
          item: { price: freePlan },
        }),
      ]);
    },
  }),
];

export const Paid = Template.bind({});
Paid.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
      fillSubscriptionPlansAllQuery(env, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.MONTHLY } }),
      ]);
      fillSubscriptionScheduleQueryWithPhases(env, [
        subscriptionPhaseFactory({
          item: { price: freePlan },
        }),
      ]);
    },
  }),
];

export const ActivePaid = Template.bind({});
ActivePaid.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
      fillSubscriptionPlansAllQuery(env, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.MONTHLY } }),
      ]);
      fillSubscriptionScheduleQueryWithPhases(env, [
        subscriptionPhaseFactory({
          item: { price: monthlyPlan },
        }),
      ]);
    },
  }),
];

export const WithTrialEligible = Template.bind({});
WithTrialEligible.decorators = [
  withProviders({
    ...defaultProvidersOptions,
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
      fillSubscriptionPlansAllQuery(env, [
        subscriptionPlanFactory({ product: { name: SubscriptionPlanName.MONTHLY } }),
      ]);
      fillSubscriptionScheduleQuery(
        env,
        subscriptionFactory({
          canActivateTrial: true,
          phases: [
            subscriptionPhaseFactory({
              item: { price: monthlyPlan },
            }),
          ],
        })
      );
    },
  }),
];
