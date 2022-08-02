import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { PasswordResetRequestForm } from './passwordResetRequestForm.component';

const Template: Story = () => {
  return (
    <ProvidersWrapper>
      <PasswordResetRequestForm />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/PasswordResetRequestForm',
  component: PasswordResetRequestForm,
};

export const Default = Template.bind({});
