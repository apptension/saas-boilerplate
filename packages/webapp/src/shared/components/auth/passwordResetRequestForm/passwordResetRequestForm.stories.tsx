import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { PasswordResetRequestForm } from './passwordResetRequestForm.component';

const Template: StoryFn = () => {
  return <PasswordResetRequestForm />;
};

export default {
  title: 'Shared/Auth/PasswordResetRequestForm',
  component: PasswordResetRequestForm,
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};
