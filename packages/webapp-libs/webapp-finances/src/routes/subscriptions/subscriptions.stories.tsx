import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { fillAllStripeChargesQuery, fillSubscriptionScheduleQueryWithPhases } from '../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../utils/storybook';
import { Subscriptions } from './currentSubscription.component';

const Template: StoryFn = () => {
  return <Subscriptions />;
};

const meta: Meta = {
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

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
