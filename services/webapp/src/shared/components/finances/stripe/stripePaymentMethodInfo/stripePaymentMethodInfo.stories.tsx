import { Story } from '@storybook/react';
import { paymentMethodFactory } from '../../../../../mocks/factories';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from './stripePaymentMethodInfo.component';

const Template: Story<StripePaymentMethodInfoProps> = (args) => {
  return <StripePaymentMethodInfo {...args} />;
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentMethodInfo',
  component: StripePaymentMethodInfo,
};

export const Default = Template.bind({});
Default.args = { method: paymentMethodFactory() };
