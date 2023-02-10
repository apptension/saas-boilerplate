import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import { append, times } from 'ramda';

import {
  fillStripeAllPaymentMethodsQuery,
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { withActiveSubscriptionContext, withProviders, withRelay } from '../../../../shared/utils/storybook';
import { EditPaymentMethodForm, EditPaymentMethodFormProps } from './editPaymentMethodForm.component';

const Template: Story<EditPaymentMethodFormProps> = (args: EditPaymentMethodFormProps) => {
  return <EditPaymentMethodForm {...args} />;
};

export default {
  title: 'Shared/Subscriptions/EditPaymentMethodForm',
  component: EditPaymentMethodForm,
  decorators: [
    withActiveSubscriptionContext,
    withProviders({
      apolloMocks: (defaultMocks) =>
        defaultMocks.concat(
          fillSubscriptionScheduleQueryWithPhases(undefined, [
            subscriptionPhaseFactory({
              item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
            }),
          ])
        ),
    }),
    // todo: finish after rebase
    withRelay((env) => {
      fillStripeAllPaymentMethodsQuery(
        times(() => paymentMethodFactory(), 3),
        env
      );
    }),
  ],
};

export const Default = Template.bind({});

Default.args = {
  onSuccess: action('onSuccess'),
};
