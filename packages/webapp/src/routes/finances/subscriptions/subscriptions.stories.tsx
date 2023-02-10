import { Story } from '@storybook/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { MockPayloadGenerator } from 'relay-test-utils';

import {
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../mocks/factories';
import StripeAllChargesQueryGraphql from '../../../modules/stripe/__generated__/stripeAllChargesQuery.graphql';
import { withActiveSubscriptionContext, withProviders, withRelay } from '../../../shared/utils/storybook';
import { connectionFromArray } from '../../../tests/utils/fixtures';
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
        defaultMocks.concat(
          fillSubscriptionScheduleQueryWithPhases(env, [
            subscriptionPhaseFactory({
              item: { price: subscriptionPlanFactory() },
            }),
          ])
        ),
    }),
    withRelay((env) => {
      env.mock.queueOperationResolver((operation: OperationDescriptor) =>
        MockPayloadGenerator.generate(operation, {
          ChargeConnection: () => connectionFromArray([]),
        })
      );
      env.mock.queuePendingOperation(StripeAllChargesQueryGraphql, {});
    }),
  ],
};

export const Default = Template.bind({});
