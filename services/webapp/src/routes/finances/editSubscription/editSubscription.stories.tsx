import { Story } from '@storybook/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { MockPayloadGenerator } from 'relay-test-utils';
import {
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../mocks/factories';
import { withActiveSubscriptionContext, withRedux, withRelay } from '../../../shared/utils/storybook';
import { SubscriptionPlanName } from '../../../shared/services/api/subscription/types';
import SubscriptionPlansAllQueryGraphql from '../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { connectionFromArray } from '../../../tests/utils/fixtures';
import { EditSubscription } from './editSubscription.component';

const Template: Story = () => {
  return <EditSubscription />;
};

export default {
  title: 'Shared/Subscriptions/EditSubscription',
  component: EditSubscription,
};

const mockMonthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  pk: 'plan_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
});
const mockYearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

export const FreeActive = Template.bind({});
FreeActive.args = { children: 'text' };
FreeActive.decorators = [
  withRedux(),
  withActiveSubscriptionContext,
  withRelay((env) => {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        SubscriptionPlanConnection: () => connectionFromArray([mockMonthlyPlan, mockYearlyPlan]),
      })
    );
    env.mock.queuePendingOperation(SubscriptionPlansAllQueryGraphql, {});
    fillSubscriptionScheduleQueryWithPhases(env, [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
      }),
    ]);
  }),
];

export const MonthlyActive = Template.bind({});
MonthlyActive.args = { children: 'text' };
MonthlyActive.decorators = [
  withRedux(),
  withActiveSubscriptionContext,
  withRelay((env) => {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        SubscriptionPlanConnection: () => connectionFromArray([mockMonthlyPlan, mockYearlyPlan]),
      })
    );
    env.mock.queuePendingOperation(SubscriptionPlansAllQueryGraphql, {});
    fillSubscriptionScheduleQueryWithPhases(env, [
      subscriptionPhaseFactory({
        item: { price: subscriptionPlanFactory() },
      }),
    ]);
  }),
];
