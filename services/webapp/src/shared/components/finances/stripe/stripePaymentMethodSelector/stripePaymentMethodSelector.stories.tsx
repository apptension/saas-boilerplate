import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { withProviders } from '../../../../utils/storybook';
import { useApiForm } from '../../../../hooks/useApiForm';
import { stripePromise } from '../../../../services/stripe';
import { StripePaymentMethodSelector, StripePaymentMethodSelectorProps } from './stripePaymentMethodSelector.component';
import { PaymentFormFields } from './stripePaymentMethodSelector.types';

const Template: Story<StripePaymentMethodSelectorProps> = (args) => {
  const formControls = useApiForm<PaymentFormFields>();
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentMethodSelector {...args} formControls={formControls} />
    </Elements>
  );
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentMethodSelector',
  component: StripePaymentMethodSelector,
  decorators: [withProviders()],
};

export const Default = Template.bind({});
Default.args = {};
