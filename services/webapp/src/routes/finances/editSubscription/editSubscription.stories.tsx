import React from 'react';
import { Story } from '@storybook/react';

import { prepareState } from '../../../mocks/store';
import { subscriptionFactory, subscriptionPhaseFactory, subscriptionPlanFactory } from '../../../mocks/factories';
import { withProviders } from '../../../shared/utils/storybook';
import { SubscriptionPlanName } from '../../../shared/services/api/subscription/types';
import { EditSubscription } from './editSubscription.component';

const storeWithPlans = (activePlan: SubscriptionPlanName) =>
  prepareState((state) => {
    state.subscription.availablePlans = [
      subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }),
      subscriptionPlanFactory({ product: { name: SubscriptionPlanName.MONTHLY } }),
      subscriptionPlanFactory({ product: { name: SubscriptionPlanName.YEARLY } }),
    ];
    state.subscription.activeSubscription = subscriptionFactory({
      phases: [subscriptionPhaseFactory({ item: { price: { product: { name: activePlan } } } })],
    });
  });

const Template: Story = (args) => {
  return <EditSubscription {...args} />;
};

export default {
  title: 'Shared/Subscriptions/EditSubscription',
  component: EditSubscription,
};

export const FreeActive = Template.bind({});
FreeActive.args = { children: 'text' };
FreeActive.decorators = [withProviders({ store: storeWithPlans(SubscriptionPlanName.FREE) })];

export const MonthlyActive = Template.bind({});
MonthlyActive.args = { children: 'text' };
MonthlyActive.decorators = [withProviders({ store: storeWithPlans(SubscriptionPlanName.MONTHLY) })];
