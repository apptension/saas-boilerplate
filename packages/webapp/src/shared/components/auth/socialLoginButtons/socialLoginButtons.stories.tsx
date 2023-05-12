import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { SignupButtonsVariant, SocialLoginButtons, SocialLoginButtonsProps } from './socialLoginButtons.component';

const Template: StoryFn<SocialLoginButtonsProps> = (args: SocialLoginButtonsProps) => {
  return <SocialLoginButtons {...args} />;
};

export default {
  title: 'Shared/Auth/SocialLoginButtons',
  component: SocialLoginButtons,
  decorators: [withProviders()],
};

export const Login = {
  render: Template,
  args: { variant: SignupButtonsVariant.LOGIN },
};

export const Signup = {
  render: Template,
  args: { variant: SignupButtonsVariant.SIGNUP },
};
