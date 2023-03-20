import { CurrentUserType } from '@sb/webapp-api-client/graphql';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { Avatar, AvatarProps } from './avatar.component';

type StoryArgsType = AvatarProps & { profile: CurrentUserType };

const Template: Story<StoryArgsType> = ({ profile, ...args }: StoryArgsType) => {
  return <Avatar {...args} />;
};

export default {
  title: 'Shared/Avatar',
  component: Avatar,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks, { args: { profile } }: any) => {
        return [fillCommonQueryWithUser(profile)];
      },
    }),
  ],
};

export const Default = Template.bind({});
Default.args = { profile: currentUserFactory() };

export const NoAvatarUser = Template.bind({});
NoAvatarUser.args = { profile: currentUserFactory({ avatar: null }) };

export const NoNameUser = Template.bind({});
NoNameUser.args = { profile: currentUserFactory({ firstName: '', lastName: '', avatar: null }) };

export const CustomSize = Template.bind({});
CustomSize.args = { size: 100 };
