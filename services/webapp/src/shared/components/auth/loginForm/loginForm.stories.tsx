import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { LoginForm } from './loginForm.component';

const Template: Story = () => {
  return (
    <ProvidersWrapper>
      <LoginForm />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/LoginForm',
  component: LoginForm,
};

export const Default = Template.bind({});
