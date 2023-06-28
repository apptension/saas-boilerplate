import { StoryFn } from '@storybook/react';

import { TwoFactorAuthForm, TwoFactorAuthFormProps } from './twoFactorAuthForm.component';

const Template: StoryFn<TwoFactorAuthFormProps> = (args) => {
  return <TwoFactorAuthForm {...args} />;
};

export default {
  title: 'Shared/Auth/TwoFactorAuthForm',
  component: TwoFactorAuthForm,
};

export const Default = {
  render: Template,
  args: {},
};
