import { Story } from '@storybook/react';
import { withProviders } from '../../../utils/storybook';
import { LoginForm } from './loginForm.component';

const Template: Story = () => {
  return <LoginForm />;
};

export default {
  title: 'Shared/Auth/LoginForm',
  component: LoginForm,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];
