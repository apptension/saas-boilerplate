import React from 'react';
import { Story } from '@storybook/react';

import { withRedux } from '../../../shared/utils/storybook';
import { withRouter } from '../../../../.storybook/decorators';
import { PaymentConfirm } from './paymentConfirm.component';

const Template: Story = (args) => {
  return <PaymentConfirm {...args} />;
};

export default {
  title: 'Routes/Finances/PaymentConfirm',
  component: PaymentConfirm,
  decorators: [withRedux(), withRouter()],
};

export const Default = Template.bind({});
Default.args = {};
