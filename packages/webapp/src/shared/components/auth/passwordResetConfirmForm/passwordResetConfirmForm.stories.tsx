import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { PasswordResetConfirmForm, PasswordResetConfirmFormProps } from './passwordResetConfirmForm.component';

const Template: StoryFn<PasswordResetConfirmFormProps> = (args: PasswordResetConfirmFormProps) => {
  return <PasswordResetConfirmForm {...args} />;
};

export default {
  title: 'Shared/Auth/PasswordResetConfirmForm',
  component: PasswordResetConfirmForm,
};

export const Default = {
  render: Template,

  args: {
    token: 'token',
    user: 'user',
  },

  decorators: [withProviders({})],
};
