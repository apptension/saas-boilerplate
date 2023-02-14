import { Story } from '@storybook/react';
import { append, times } from 'ramda';

import {
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../mocks/factories';
import { SubscriptionPlanName } from '../../../shared/services/api/subscription/types';
import { withActiveSubscriptionContext, withProviders } from '../../../shared/utils/storybook';
import { PaymentConfirm } from './paymentConfirm.component';

const Template: Story = () => {
  return <PaymentConfirm />;
};

export default {
  title: 'Routes/Finances/PaymentConfirm',
  component: PaymentConfirm,
  decorators: [
    withActiveSubscriptionContext,
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases(
          undefined,
          [
            subscriptionPhaseFactory({
              item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
            }),
          ],
          times(() => paymentMethodFactory(), 3)
        )
      ),
    }),
  ],
};

export const Default = Template.bind({});
Default.args = {};
