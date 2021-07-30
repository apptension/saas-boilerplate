import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../utils/testUtils';
import { loggedInAuthFactory, userProfileFactory } from '../../../mocks/factories';
import { Profile } from '../../../modules/auth/auth.types';
import { Avatar, AvatarProps } from './avatar.component';

const Template: Story<AvatarProps & { profile: Profile }> = ({ profile, ...args }) => {
  return (
    <ProvidersWrapper
      context={{
        store: (state) => {
          state.auth = loggedInAuthFactory(profile ? { profile } : {});
        },
      }}
    >
      <Avatar {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Avatar',
  component: Avatar,
};

export const Default = Template.bind({});

export const NoAvatarUser = Template.bind({});
NoAvatarUser.args = { profile: userProfileFactory({ avatar: null }) };

export const NoNameUser = Template.bind({});
NoNameUser.args = { profile: userProfileFactory({ firstName: '', lastName: '', avatar: null }) };

export const CustomSize = Template.bind({});
CustomSize.args = { size: 100 };
