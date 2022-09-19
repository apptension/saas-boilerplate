import { Story } from '@storybook/react';
import { withActiveSubscriptionContext, withRedux, withRelay } from '../../../shared/utils/storybook';
import {
  queueSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../mocks/factories';
import { CancelSubscription } from './cancelSubscription.component';

const Template: Story = () => {
  return <CancelSubscription />;
};

export default {
  title: 'Routes/Subscriptions/CancelSubscription',
  component: CancelSubscription,
  decorators: [
    withActiveSubscriptionContext,
    withRedux(),
    withRelay((env) => {
      queueSubscriptionScheduleQueryWithPhases(env, [
        subscriptionPhaseFactory({
          item: { price: subscriptionPlanFactory() },
        }),
      ]);
    }),
  ],
};

export const Default = Template.bind({});
Default.args = {};
