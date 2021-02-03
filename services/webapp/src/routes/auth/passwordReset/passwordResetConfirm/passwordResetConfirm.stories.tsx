import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../../shared/utils/testUtils';
import { PasswordResetConfirm } from './passwordResetConfirm.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <PasswordResetConfirm {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/PasswordResetConfirm',
  component: PasswordResetConfirm,
};

export const Default = Template.bind({});
