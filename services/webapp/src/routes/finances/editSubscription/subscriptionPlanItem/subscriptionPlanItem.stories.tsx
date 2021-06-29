import { Story } from '@storybook/react';
import { subscriptionFactory, subscriptionPhaseFactory, subscriptionPlanFactory } from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { withProviders } from '../../../../shared/utils/storybook';
import { prepareState } from '../../../../mocks/store';
import { SubscriptionPlanItem, SubscriptionPlanItemProps } from './subscriptionPlanItem.component';

const Template: Story<SubscriptionPlanItemProps> = (args) => {
  return <SubscriptionPlanItem {...args} />;
};

const freePlan = subscriptionPlanFactory();
freePlan.product.name = SubscriptionPlanName.FREE;

const monthlyPlan = subscriptionPlanFactory();
monthlyPlan.product.name = SubscriptionPlanName.MONTHLY;

const storeWithFreePlan = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    phases: [subscriptionPhaseFactory({ item: { price: freePlan } })],
  });
});

const storeWithMonthlyPlan = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
  });
});

const storeWithTrialEligible = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: true });
});

export default {
  title: 'Shared/Subscriptions/SubscriptionPlanItem',
  component: SubscriptionPlanItem,
};

export const Free = Template.bind({});
Free.args = { plan: freePlan };
Free.decorators = [withProviders({ store: storeWithMonthlyPlan })];

export const ActiveFree = Template.bind({});
ActiveFree.args = { plan: freePlan };
ActiveFree.decorators = [withProviders({ store: storeWithFreePlan })];

export const Paid = Template.bind({});
Paid.args = { plan: monthlyPlan };
Paid.decorators = [withProviders({ store: storeWithFreePlan })];

export const ActivePaid = Template.bind({});
ActivePaid.args = { plan: monthlyPlan };
ActivePaid.decorators = [withProviders({ store: storeWithMonthlyPlan })];

export const WithTrialEligible = Template.bind({});
WithTrialEligible.args = { plan: monthlyPlan };
WithTrialEligible.decorators = [withProviders({ store: storeWithTrialEligible })];
