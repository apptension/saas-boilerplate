import { Story } from '@storybook/react';
import { withProviders } from '../../../utils/storybook';
import { PasswordResetConfirmForm, PasswordResetConfirmFormProps } from './passwordResetConfirmForm.component';

const Template: Story<PasswordResetConfirmFormProps> = (args: PasswordResetConfirmFormProps) => {
  return <PasswordResetConfirmForm {...args} />;
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
Default.decorators = [withProviders({})];
