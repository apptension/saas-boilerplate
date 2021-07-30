import { Story } from '@storybook/react';
import { subscriptionFactory } from '../../../mocks/factories';
import { withProviders } from '../../../shared/utils/storybook';
import { Subscriptions } from './subscriptions.component';

const Template: Story = (args) => {
  return <Subscriptions {...args} />;
};

export default {
  title: 'Routes/Subscriptions/Subscription details',
  component: Subscriptions,
  decorators: [
    withProviders({
      store: (state) => {
        state.subscription.activeSubscription = subscriptionFactory();
      },
    }),
  ],
};

export const Default = Template.bind({});
