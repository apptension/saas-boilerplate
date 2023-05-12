import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import {
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append, times } from 'ramda';

import { fillSubscriptionScheduleQueryWithPhases } from '../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../utils/storybook';
import { PaymentConfirm } from './paymentConfirm.component';

const Template: StoryFn = () => {
  return <PaymentConfirm />;
};

const meta: Meta = {
  title: 'Routes/Finances/PaymentConfirm',
  component: PaymentConfirm,
  decorators: [
    withActiveSubscriptionContext,
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases(
          [
            subscriptionPhaseFactory({
              item: {
                price: subscriptionPlanFactory({
                  product: { name: SubscriptionPlanName.FREE },
                }),
              },
            }),
          ],
          times(() => paymentMethodFactory(), 3)
        )
      ),
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  args: {},
};
