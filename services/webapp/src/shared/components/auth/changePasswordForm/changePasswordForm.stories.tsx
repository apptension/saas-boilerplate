import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../utils/testUtils';
import { ChangePasswordForm } from './changePasswordForm.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <ChangePasswordForm {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/ChangePasswordForm',
  component: ChangePasswordForm,
};

export const Default = Template.bind({});
