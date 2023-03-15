import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';

import { fillAllStripeChargesQuery, fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
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
          fillSubscriptionScheduleQueryWithPhases([
            subscriptionPhaseFactory({
              item: { price: subscriptionPlanFactory() },
            }),
          ]),
          fillAllStripeChargesQuery([]),
        ]),
    }),
  ],
};

export const Default = Template.bind({});
