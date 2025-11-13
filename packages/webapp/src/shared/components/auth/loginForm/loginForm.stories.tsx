import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { LoginForm } from './loginForm.component';

const Template: StoryFn = () => {
  return <LoginForm />;
};

export default {
  title: 'Shared/Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};

export const WithError = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => {
        // Mock an error state - this will show when form is submitted with invalid credentials
        return defaultMocks;
      },
    }),
  ],
};
