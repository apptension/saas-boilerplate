import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { PasswordResetConfirmForm, PasswordResetConfirmFormProps } from './passwordResetConfirmForm.component';

const Template: StoryFn<PasswordResetConfirmFormProps> = (args: PasswordResetConfirmFormProps) => {
  return <PasswordResetConfirmForm {...args} />;
};

export default {
  title: 'Shared/Auth/PasswordResetConfirmForm',
  component: PasswordResetConfirmForm,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  render: Template,
  args: {
    token: 'sample-reset-token-12345',
    user: 'sample-user-id',
  },
  decorators: [withProviders({})],
};
