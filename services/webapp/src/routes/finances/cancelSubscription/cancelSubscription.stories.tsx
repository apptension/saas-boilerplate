import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { subscriptionFactory } from '../../../mocks/factories';
import { CancelSubscription } from './cancelSubscription.component';

const Template: Story = (args) => {
  return <CancelSubscription {...args} />;
};

export default {
  title: 'Routes/Subscriptions/CancelSubscription',
  component: CancelSubscription,
  decorators: [
    withProviders({
      store: (state) => {
        state.subscription.activeSubscription = subscriptionFactory();
      },
    }),
  ],
};

export const Default = Template.bind({});
Default.args = {};
