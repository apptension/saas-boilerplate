import { Story } from '@storybook/react';
import { withProviders } from '../../../utils/storybook';
import { SocialLoginButtons, SocialLoginButtonsProps, SignupButtonsVariant } from './socialLoginButtons.component';

const Template: Story<SocialLoginButtonsProps> = (args: SocialLoginButtonsProps) => {
  return <SocialLoginButtons {...args} />;
};

export default {
  title: 'Shared/Auth/SocialLoginButtons',
  component: SocialLoginButtons,
  decorators: [withProviders()],
};

export const Login = Template.bind({});
Login.args = { variant: SignupButtonsVariant.LOGIN };

export const Signup = Template.bind({});
Signup.args = { variant: SignupButtonsVariant.SIGNUP };
