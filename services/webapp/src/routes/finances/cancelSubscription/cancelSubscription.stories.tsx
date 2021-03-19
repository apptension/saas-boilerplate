import React from 'react';
import { Story } from '@storybook/react';

import { withProviders } from '../../../shared/utils/storybook';
import { prepareState } from '../../../mocks/store';
import { subscriptionFactory } from '../../../mocks/factories';
import { CancelSubscription } from './cancelSubscription.component';

const store = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory();
});

const Template: Story = (args) => {
  return <CancelSubscription {...args} />;
};

export default {
  title: 'Routes/Subscriptions/CancelSubscription',
  component: CancelSubscription,
  decorators: [withProviders({ store })],
};

export const Default = Template.bind({});
Default.args = {};
