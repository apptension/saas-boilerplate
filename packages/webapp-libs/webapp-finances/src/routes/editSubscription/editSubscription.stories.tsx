import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { fillSubscriptionPlansAllQuery, fillSubscriptionScheduleQueryWithPhases } from '../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../utils/storybook';
import { EditSubscription } from './editSubscription.component';

const Template: StoryFn = () => {
  return <EditSubscription />;
};

const meta: Meta = {
  title: 'Routes/Subscriptions/EditSubscription',
  component: EditSubscription,
};

export default meta;

const mockMonthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  pk: 'plan_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
});
const mockYearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

export const FreeActive: StoryObj<typeof meta> = Template.bind({});
FreeActive.args = { children: 'text' };
FreeActive.decorators = [
  withActiveSubscriptionContext,
  withProviders({
    apolloMocks: (defaultMocks) =>
      defaultMocks.concat([
        fillSubscriptionPlansAllQuery([mockMonthlyPlan, mockYearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
          }),
        ]),
      ]),
  }),
];

export const MonthlyActive: StoryObj<typeof meta> = Template.bind({});
MonthlyActive.args = { children: 'text' };
MonthlyActive.decorators = [
  withActiveSubscriptionContext,
  withProviders({
    apolloMocks: (defaultMocks) =>
      defaultMocks.concat([
        fillSubscriptionPlansAllQuery([mockMonthlyPlan, mockYearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: subscriptionPlanFactory() },
          }),
        ]),
      ]),
  }),
];
