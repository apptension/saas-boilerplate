import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { ChangePasswordForm } from './changePasswordForm.component';

const Template: StoryFn = () => {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 lg:px-10">
      <ChangePasswordForm />
    </div>
  );
};

export default {
  title: 'Shared/Auth/ChangePasswordForm',
  component: ChangePasswordForm,
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};
