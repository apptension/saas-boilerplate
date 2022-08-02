import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { Login } from './login.component';

const Template: Story = () => {
  return (
    <ProvidersWrapper>
      <Login />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/Login',
  component: Login,
};

export const Default = Template.bind({});
