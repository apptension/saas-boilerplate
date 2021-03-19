import React from 'react';
import { Story } from '@storybook/react';

import { withProviders } from '../../../../.storybook/decorators';
import { prepareState } from '../../../mocks/store';
import { subscriptionFactory } from '../../../mocks/factories';
import { Subscriptions } from './subscriptions.component';

const store = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory();
});

const Template: Story = (args) => {
  return <Subscriptions {...args} />;
};

export default {
  title: 'Routes/Subscriptions',
  component: Subscriptions,
  decorators: [withProviders({ store })],
};

export const Default = Template.bind({});
