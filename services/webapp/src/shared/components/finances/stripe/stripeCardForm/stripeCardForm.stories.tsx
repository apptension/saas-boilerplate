import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../../services/stripe';
import { StripeCardForm, StripeCardFormProps } from './stripeCardForm.component';

const Template: Story<StripeCardFormProps> = (args: StripeCardFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm {...args} />
    </Elements>
  );
};

export default {
  title: 'Shared/Finances/Stripe/StripeCardForm',
  component: StripeCardForm,
};

export const Default = Template.bind({});
Default.args = { onChange: action('onChange') };
