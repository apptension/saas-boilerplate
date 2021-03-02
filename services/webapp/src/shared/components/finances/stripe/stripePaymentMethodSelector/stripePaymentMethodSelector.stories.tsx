import React from 'react';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { times } from 'ramda';

import { paymentMethodFactory } from '../../../../../mocks/factories/stripe';
import { StripePaymentMethodSelector, StripePaymentMethodSelectorProps } from './stripePaymentMethodSelector.component';

const Template: Story<StripePaymentMethodSelectorProps> = (args) => {
  return <StripePaymentMethodSelector {...args} />;
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentMethodSelector',
  component: StripePaymentMethodSelector,
  decorators: [],
};

export const Default = Template.bind({});
Default.args = {
  paymentMethods: times(() => paymentMethodFactory(), 3),
  onChange: action('change'),
  value: undefined,
};
