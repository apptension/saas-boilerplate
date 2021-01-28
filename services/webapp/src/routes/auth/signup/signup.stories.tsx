import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { Signup } from './signup.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <Signup {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/Signup',
  component: Signup,
};

export const Default = Template.bind({});
