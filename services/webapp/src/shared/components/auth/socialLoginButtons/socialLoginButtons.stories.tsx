import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../utils/testUtils';
import { SocialLoginButtons } from './socialLoginButtons.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <SocialLoginButtons {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/SocialLoginButtons',
  component: SocialLoginButtons,
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
