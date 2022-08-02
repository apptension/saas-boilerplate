import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { PasswordResetConfirmForm, PasswordResetConfirmFormProps } from './passwordResetConfirmForm.component';

const Template: Story<PasswordResetConfirmFormProps> = (args: PasswordResetConfirmFormProps) => {
  return (
    <ProvidersWrapper>
      <PasswordResetConfirmForm {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/PasswordResetConfirmForm',
  component: PasswordResetConfirmForm,
};

export const Default = Template.bind({});
Default.args = {
  token: 'token',
  user: 'user',
};
