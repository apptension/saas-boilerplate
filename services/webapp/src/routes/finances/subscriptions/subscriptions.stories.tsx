import { Story } from '@storybook/react';
import { prepareState } from '../../../mocks/store';
import { subscriptionFactory } from '../../../mocks/factories';
import { withProviders } from '../../../shared/utils/storybook';
import { Subscriptions } from './subscriptions.component';

const store = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory();
});

const Template: Story = (args) => {
  return <Subscriptions {...args} />;
};

export default {
  title: 'Routes/Subscriptions/Subscription details',
  component: Subscriptions,
  decorators: [withProviders({ store })],
};

export const Default = Template.bind({});
