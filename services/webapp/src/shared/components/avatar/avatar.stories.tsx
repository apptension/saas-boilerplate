import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory, userProfileFactory } from '../../../mocks/factories';
import { Profile } from '../../../modules/auth/auth.types';
import { Avatar, AvatarProps } from './avatar.component';

const Template: Story<AvatarProps & { profile: Profile }> = ({ profile, ...args }) => {
  const store = prepareState((state) => {
    state.auth = loggedInAuthFactory(profile ? { profile } : {});
  });
  return (
    <ProvidersWrapper context={{ store }}>
      <Avatar {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Avatar',
  component: Avatar,
};

export const Default = Template.bind({});

export const NoNameUser = Template.bind({});
NoNameUser.args = { profile: userProfileFactory({ firstName: '', lastName: '' }) };

export const CustomSize = Template.bind({});
CustomSize.args = { size: 100 };
