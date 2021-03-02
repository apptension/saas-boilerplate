import React from 'react';
import { Story } from '@storybook/react';

import { withRedux } from '../../../shared/utils/storybook';
import { PaymentConfirm } from './paymentConfirm.component';

const Template: Story = (args) => {
  return <PaymentConfirm {...args} />;
};

export default {
  title: 'Routes/Finances/PaymentConfirm',
  component: PaymentConfirm,
  decorators: [withRedux()],
};

export const Default = Template.bind({});
Default.args = {};
