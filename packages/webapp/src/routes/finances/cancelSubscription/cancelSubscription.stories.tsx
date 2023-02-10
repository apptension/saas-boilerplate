import { Story } from '@storybook/react';
import { append } from 'ramda';

import {
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../mocks/factories';
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
        fillSubscriptionScheduleQueryWithPhases(undefined, [
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
