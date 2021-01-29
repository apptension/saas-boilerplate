import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { ConfirmEmail } from './confirmEmail.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <ConfirmEmail {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'ConfirmEmail',
  component: ConfirmEmail,
};

export const Default = Template.bind({});
