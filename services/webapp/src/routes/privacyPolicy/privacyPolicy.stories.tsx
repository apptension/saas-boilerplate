import { Story } from '@storybook/react';
import { appConfigFactory } from '../../mocks/factories';
import { withProviders } from '../../shared/utils/storybook';
import { PrivacyPolicy } from './privacyPolicy.component';

const Template: Story = () => {
  return <PrivacyPolicy />;
};

export default {
  title: 'Routes/PrivacyPolicy',
  component: PrivacyPolicy,
  decorators: [
    withProviders({
      store: (state) => {
        state.config = appConfigFactory();
      },
    }),
  ],
};

export const Default = Template.bind({});
