import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { Login } from './login.component';

const Template: Story = () => {
  return <Login />;
};

export default {
  title: 'Routes/Auth/Login',
  component: Login,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];
