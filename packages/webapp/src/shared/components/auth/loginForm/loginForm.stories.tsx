import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { LoginForm } from './loginForm.component';

const Template: StoryFn = () => {
  return <LoginForm />;
};

export default {
  title: 'Shared/Auth/LoginForm',
  component: LoginForm,
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};
