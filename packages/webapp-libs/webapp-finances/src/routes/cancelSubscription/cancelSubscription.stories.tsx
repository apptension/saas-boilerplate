import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { fillSubscriptionScheduleQueryWithPhases } from '../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../utils/storybook';
import { CancelSubscription } from './cancelSubscription.component';

const Template: StoryFn = () => {
  return <CancelSubscription />;
};

const meta: Meta = {
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

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
