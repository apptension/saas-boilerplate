import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { times } from 'ramda';
import { withActiveSubscriptionContext, withRelay } from '../../../../shared/utils/storybook';
import {
  generateRelayEnvironmentWithPaymentMethods,
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { EditPaymentMethodForm, EditPaymentMethodFormProps } from './editPaymentMethodForm.component';

const Template: Story<EditPaymentMethodFormProps> = (args: EditPaymentMethodFormProps) => {
  return <EditPaymentMethodForm {...args} />;
};

export default {
  title: 'Shared/Subscriptions/EditPaymentMethodForm',
  component: EditPaymentMethodForm,
  decorators: [
    withActiveSubscriptionContext,
    withRelay((env) => {
      fillSubscriptionScheduleQueryWithPhases(env, [
        subscriptionPhaseFactory({
          item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
        }),
      ]);
      generateRelayEnvironmentWithPaymentMethods(
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
