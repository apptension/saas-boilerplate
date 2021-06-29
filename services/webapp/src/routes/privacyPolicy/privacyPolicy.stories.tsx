import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { prepareState } from '../../mocks/store';
import { appConfigFactory } from '../../mocks/factories';
import { PrivacyPolicy } from './privacyPolicy.component';

const store = prepareState((state) => {
  state.config = appConfigFactory();
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper context={{ store }}>
      <PrivacyPolicy {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/PrivacyPolicy',
  component: PrivacyPolicy,
};

export const Default = Template.bind({});
