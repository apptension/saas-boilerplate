import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../../shared/utils/storybook';
import { CancelSubscription } from './cancelSubscription.component';

const Template: Story = () => {
  return <CancelSubscription />;
};

export default {
  title: 'Routes/Subscriptions/CancelSubscription',
  component: CancelSubscription,
  decorators: [
    withActiveSubscriptionContext,
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: subscriptionPlanFactory() },
          }),
        ])
      ),
    }),
  ],
};

export const Default = Template.bind({});
Default.args = {};
