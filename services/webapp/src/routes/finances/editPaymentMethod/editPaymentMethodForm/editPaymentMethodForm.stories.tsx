import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';
import { times } from 'ramda';
import { withRedux } from '../../../../shared/utils/storybook';
import { stripePromise } from '../../../../shared/services/stripe';
import { paymentMethodFactory } from '../../../../mocks/factories';
import { EditPaymentMethodForm, EditPaymentMethodFormProps } from './editPaymentMethodForm.component';

const Template: Story<EditPaymentMethodFormProps> = (args: EditPaymentMethodFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <EditPaymentMethodForm {...args} />
    </Elements>
  );
};

export default {
  title: 'Shared/Subscriptions/EditPaymentMethodForm',
  component: EditPaymentMethodForm,
  decorators: [
    withRedux((state) => {
      // state.stripe.paymentMethods = times(() => paymentMethodFactory(), 3);
    }),
  ],
};

export const Default = Template.bind({});

Default.args = {
  onSuccess: action('onSuccess'),
};
