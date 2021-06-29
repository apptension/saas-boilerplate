import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { SignupForm } from './signupForm.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <SignupForm {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/SignupForm',
  component: SignupForm,
};

export const Default = Template.bind({});
