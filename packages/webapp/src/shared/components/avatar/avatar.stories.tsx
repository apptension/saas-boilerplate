import { Story } from '@storybook/react';

import { currentUserFactory } from '../../../mocks/factories';
import { CurrentUserType } from '../../services/graphqlApi/__generated/types';
import { fillCommonQueryWithUser } from '../../utils/commonQuery';
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
      relayEnvironment: (env, { args: { profile } }: any) => {
        fillCommonQueryWithUser(env, profile);
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
