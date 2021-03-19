import React from 'react';
import { Story } from '@storybook/react';

import { subscriptionPlanFactory } from '../../../../mocks/factories';
import { SubscriptionPlanItem, SubscriptionPlanItemProps } from './subscriptionPlanItem.component';

const Template: Story<SubscriptionPlanItemProps> = (args) => {
  return <SubscriptionPlanItem {...args} />;
};

export default {
  title: 'Shared/Subscriptions/SubscriptionPlanItem',
  component: SubscriptionPlanItem,
};

export const Default = Template.bind({});
Default.args = { plan: subscriptionPlanFactory() };
