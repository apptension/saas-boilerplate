import { useQuery } from '@apollo/client';
import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { getLocalePath } from '@sb/webapp-core/utils';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ActiveSubscriptionContext, useActiveSubscriptionDetails } from '../../../components/activeSubscriptionContext';
import { RoutesConfig } from '../../../config/routes';
import {
  fillSubscriptionPlansAllQuery,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
} from '../../../tests/factories';
import { createMockRouterProps } from '../../../tests/utils/rendering';
import { withProviders } from '../../../utils/storybook';
import { subscriptionPlansAllQuery } from '../subscriptionPlans/subscriptionPlans.graphql';
import { SubscriptionPlanItem } from './subscriptionPlanItem.component';

const routePath = RoutesConfig.subscriptions.index;

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

const Template: StoryFn = () => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route path={getLocalePath(routePath)} element={<Wrapper />} />
      </Route>
    </Routes>
  );
};

const freePlan = subscriptionPlanFactory();
freePlan.product.name = SubscriptionPlanName.FREE;

const monthlyPlan = subscriptionPlanFactory();
monthlyPlan.product.name = SubscriptionPlanName.MONTHLY;

const meta: Meta = {
  title: 'Routes/Subscriptions/SubscriptionPlanItem',
  component: SubscriptionPlanItem,
};

export default meta;

export const Free: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([
          subscriptionPlanFactory({
            product: { name: SubscriptionPlanName.FREE },
          }),
        ]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: monthlyPlan },
          }),
        ]),
      ],
    }),
  ],
};

export const ActiveFree: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([
          subscriptionPlanFactory({
            product: { name: SubscriptionPlanName.FREE },
          }),
        ]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: freePlan },
          }),
        ]),
      ],
    }),
  ],
};

export const Paid: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([
          subscriptionPlanFactory({
            product: { name: SubscriptionPlanName.MONTHLY },
          }),
        ]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: freePlan },
          }),
        ]),
      ],
    }),
  ],
};

export const ActivePaid: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([
          subscriptionPlanFactory({
            product: { name: SubscriptionPlanName.MONTHLY },
          }),
        ]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: monthlyPlan },
          }),
        ]),
      ],
    }),
  ],
};

export const WithTrialEligible: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([
          subscriptionPlanFactory({
            product: { name: SubscriptionPlanName.MONTHLY },
          }),
        ]),
        fillSubscriptionScheduleQuery(
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
  ],
};
