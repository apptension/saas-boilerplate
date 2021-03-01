import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory } from '../../../mocks/factories';
import { Avatar, AvatarProps } from './avatar.component';

const Template: Story<AvatarProps> = (args) => {
  const store = prepareState((state) => {
    state.auth = loggedInAuthFactory();
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

export const CustomSize = Template.bind({});
CustomSize.args = { size: 100 };
