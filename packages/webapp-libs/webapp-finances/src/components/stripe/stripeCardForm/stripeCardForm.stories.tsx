import { action } from '@storybook/addon-actions';
import { StoryFn, StoryObj } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';

import { stripePromise } from '../../../services/stripe';
import { StripeCardForm, StripeCardFormProps } from './stripeCardForm.component';

const Template: StoryFn<StripeCardFormProps> = (args: StripeCardFormProps) => {
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

type Story = StoryObj<typeof StripeCardForm>;

export const Default: Story = {
  render: Template,
  args: { onChange: action('onChange') },
};
