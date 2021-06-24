import React from 'react';
import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { SocialLoginButtons, SocialLoginButtonsProps, SignupButtonsVariant } from './socialLoginButtons.component';

const Template: Story<SocialLoginButtonsProps> = (args) => {
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

export const Login = Template.bind({});
Login.args = { variant: SignupButtonsVariant.LOGIN };

export const Signup = Template.bind({});
Signup.args = { variant: SignupButtonsVariant.SIGNUP };
