import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { prepareState } from '../../mocks/store';
import { userProfileFactory } from '../../mocks/factories';
import { Profile } from './profile.component';

const store = prepareState((state) => {
  state.auth.profile = userProfileFactory();
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper context={{ store }}>
      <Profile {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/Profile',
  component: Profile,
};

export const Default = Template.bind({});
