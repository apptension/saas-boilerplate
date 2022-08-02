import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { userProfileFactory } from '../../mocks/factories';
import { Profile } from './profile.component';

const Template: Story = () => {
  return (
    <ProvidersWrapper
      context={{
        store: (state) => {
          state.auth.profile = userProfileFactory();
        },
      }}
    >
      <Profile />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/Profile',
  component: Profile,
};

export const Default = Template.bind({});
