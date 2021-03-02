import React from 'react';
import { Story } from '@storybook/react';
import { Route, generatePath } from 'react-router-dom';

import { withRouter } from '../../../../.storybook/decorators';
import { ROUTES } from '../../app.constants';
import { PaymentSuccess } from './paymentSuccess.component';

const Template: Story = (args) => {
  return (
    <Route path={ROUTES.finances.paymentSuccess}>
      <PaymentSuccess {...args} />
    </Route>
  );
};

export default {
  title: 'Routes/Finances/PaymentSuccess',
  component: PaymentSuccess,
  decorators: [
    withRouter(
      {},
      {
        initialEntries: [generatePath(ROUTES.finances.paymentSuccess, { paymentIntentId: 'intent-1' })],
      }
    ),
  ],
};

export const Default = Template.bind({});
Default.args = {};
