import { Story } from '@storybook/react';

import {
  fillAllStripeChargesQuery,
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../mocks/factories';
import { withActiveSubscriptionContext, withProviders } from '../../../shared/utils/storybook';
import { Subscriptions } from './subscriptions.component';

const Template: Story = () => {
  return <Subscriptions />;
};

export default {
  title: 'Routes/Subscriptions/Subscription details',
  component: Subscriptions,
  decorators: [
    withActiveSubscriptionContext,
    withProviders({
      apolloMocks: (defaultMocks) =>
        defaultMocks.concat([
          fillSubscriptionScheduleQueryWithPhases(undefined, [
            subscriptionPhaseFactory({
              item: { price: subscriptionPlanFactory() },
            }),
          ]),
          fillAllStripeChargesQuery(undefined, []),
        ]),
    }),
  ],
};

export const Default = Template.bind({});
