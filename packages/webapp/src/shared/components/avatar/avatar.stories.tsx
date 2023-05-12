import { CurrentUserType } from '@sb/webapp-api-client/graphql';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { StoryFn } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { Avatar, AvatarProps } from './avatar.component';

type StoryArgsType = AvatarProps & { profile: CurrentUserType };

const Template: StoryFn<StoryArgsType> = ({ profile, ...args }: StoryArgsType) => {
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

export const Default = {
  render: Template,
  args: { profile: currentUserFactory() },
};

export const NoAvatarUser = {
  render: Template,
  args: { profile: currentUserFactory({ avatar: null }) },
};

export const NoNameUser = {
  render: Template,
  args: {
    profile: currentUserFactory({ firstName: '', lastName: '', avatar: null }),
  },
};

export const CustomSize = {
  render: Template,
  args: { size: 100 },
};
