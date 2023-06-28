import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import {
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { times } from 'ramda';

import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../../utils/storybook';
import { EditPaymentMethodForm, EditPaymentMethodFormProps } from './editPaymentMethodForm.component';

const Template: StoryFn<EditPaymentMethodFormProps> = (args: EditPaymentMethodFormProps) => {
  return <EditPaymentMethodForm {...args} />;
};

const meta: Meta<typeof EditPaymentMethodForm> = {
  title: 'Routes/Subscriptions/EditPaymentMethodForm',
  component: EditPaymentMethodForm,
  decorators: [
    withActiveSubscriptionContext,
    withProviders({
      apolloMocks: (defaultMocks) => {
        const paymentMethods = times(() => paymentMethodFactory(), 3);
        return defaultMocks.concat(
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
            paymentMethods
          )
        );
      },
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,

  args: {
    onSuccess: action('onSuccess'),
  },
};
