import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../utils/testUtils';
import { LoginForm } from './loginForm.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <LoginForm {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/LoginForm',
  component: LoginForm,
};

export const Default = Template.bind({});
