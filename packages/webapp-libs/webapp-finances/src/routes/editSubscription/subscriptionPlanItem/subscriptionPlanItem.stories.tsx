import { useQuery } from '@apollo/client/react';
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
      <div className="max-w-md">
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
      </div>
    </Suspense>
  );
};

const AllPlansWrapper = () => {
  const { data, loading } = useQuery(subscriptionPlansAllQuery);
  const { activeSubscription } = useActiveSubscriptionDetails();

  return (
    <Suspense fallback="Loading...">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
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
      </div>
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

const AllPlansTemplate: StoryFn = () => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route path={getLocalePath(routePath)} element={<AllPlansWrapper />} />
      </Route>
    </Routes>
  );
};

const freePlan = subscriptionPlanFactory({
  id: 'plan_free',
  pk: 'price_free',
  product: { name: SubscriptionPlanName.FREE },
  unitAmount: 0,
});

const monthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  pk: 'price_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
  unitAmount: 1000,
});

const yearlyPlan = subscriptionPlanFactory({
  id: 'plan_yearly',
  pk: 'price_yearly',
  product: { name: SubscriptionPlanName.YEARLY },
  unitAmount: 10000,
});

const meta: Meta = {
  title: 'Routes/Subscriptions/SubscriptionPlanItem',
  component: SubscriptionPlanItem,
  parameters: {
    docs: {
      description: {
        component:
          'Subscription plan item component with visual distinctions for different plan states: Free, Paid (Monthly), Premium (Yearly), Active, and Trial Eligible.',
      },
    },
  },
};

export default meta;

export const Free: StoryObj<typeof meta> = {
  render: Template,
  parameters: {
    docs: {
      description: {
        story: 'Free plan with muted styling, indicating a no-cost tier.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([freePlan]),
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
  parameters: {
    docs: {
      description: {
        story: 'Free plan that is currently active, showing the "Active" badge and ring styling.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([freePlan]),
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
  parameters: {
    docs: {
      description: {
        story: 'Monthly paid plan with blue accent styling.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([monthlyPlan]),
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
  parameters: {
    docs: {
      description: {
        story: 'Monthly paid plan that is currently active with primary ring and Active badge.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([monthlyPlan]),
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
  parameters: {
    docs: {
      description: {
        story: 'Plan showing trial eligibility notice for users who can start a free trial.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([monthlyPlan]),
        fillSubscriptionScheduleQuery(
          subscriptionFactory({
            canActivateTrial: true,
            phases: [
              subscriptionPhaseFactory({
                item: { price: freePlan },
              }),
            ],
          })
        ),
      ],
    }),
  ],
};

export const YearlyPlan: StoryObj<typeof meta> = {
  render: Template,
  parameters: {
    docs: {
      description: {
        story: 'Premium yearly plan with amber/gold styling and "Best value" ribbon.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([yearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: freePlan },
          }),
        ]),
      ],
    }),
  ],
};

export const ActiveYearly: StoryObj<typeof meta> = {
  render: Template,
  parameters: {
    docs: {
      description: {
        story: 'Premium yearly plan that is currently active.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([yearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: yearlyPlan },
          }),
        ]),
      ],
    }),
  ],
};

export const AllPlansComparison: StoryObj<typeof meta> = {
  render: AllPlansTemplate,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All three plan types displayed side by side for comparison, showing the visual hierarchy.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([freePlan, monthlyPlan, yearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: freePlan },
          }),
        ]),
      ],
    }),
  ],
};

export const AllPlansWithActiveMonthly: StoryObj<typeof meta> = {
  render: AllPlansTemplate,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'All plans with Monthly being the active subscription, showing how inactive plans appear alongside the active one.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([freePlan, monthlyPlan, yearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: monthlyPlan },
          }),
        ]),
      ],
    }),
  ],
};

export const AllPlansWithTrialEligible: StoryObj<typeof meta> = {
  render: AllPlansTemplate,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'All plans with trial eligibility notice shown on paid plans.',
      },
    },
  },
  decorators: [
    withProviders({
      ...defaultProvidersOptions,
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUserFactory()),
        fillSubscriptionPlansAllQuery([freePlan, monthlyPlan, yearlyPlan]),
        fillSubscriptionScheduleQuery(
          subscriptionFactory({
            canActivateTrial: true,
            phases: [
              subscriptionPhaseFactory({
                item: { price: freePlan },
              }),
            ],
          })
        ),
      ],
    }),
  ],
};
