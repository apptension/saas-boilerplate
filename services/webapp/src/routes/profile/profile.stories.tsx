import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { Profile } from './profile.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <Profile {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/Profile',
  component: Profile,
};

export const Default = Template.bind({});
