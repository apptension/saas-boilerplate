import React from 'react';
import { Story } from '@storybook/react';

import { times } from 'ramda';
import { withProviders } from '../../../../.storybook/decorators';
import { prepareState } from '../../../mocks/store';
import { subscriptionPlanFactory } from '../../../mocks/factories';
import { EditSubscription } from './editSubscription.component';

const storeWithPlans = prepareState((state) => {
  state.subscription.availablePlans = times(() => subscriptionPlanFactory(), 2);
});

const Template: Story = (args) => {
  return <EditSubscription {...args} />;
};

export default {
  title: 'Shared/Subscriptions/EditSubscription',
  component: EditSubscription,
  decorators: [withProviders({ store: storeWithPlans })],
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
