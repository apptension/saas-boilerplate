import React from 'react';
import { Story } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import { StripeCardForm, StripeCardFormProps } from './stripeCardForm.component';

const Template: Story<StripeCardFormProps> = (args) => {
  return <StripeCardForm {...args} />;
};

export default {
  title: 'StripeCardForm',
  component: StripeCardForm,
};

export const Default = Template.bind({});
Default.args = { onChange: action('onChange') };
