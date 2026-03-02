import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../shared/utils/storybook';
import { Login } from './login.component';

const Template: StoryFn = () => {
  return <Login />;
};

export default {
  title: 'Routes/Auth/Login',
  component: Login,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};
