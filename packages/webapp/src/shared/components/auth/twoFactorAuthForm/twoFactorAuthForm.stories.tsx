import { Story } from '@storybook/react';
import { TwoFactorAuthForm, TwoFactorAuthFormProps } from './twoFactorAuthForm.component';

const Template: Story<TwoFactorAuthFormProps> = (args) => {
  return <TwoFactorAuthForm {...args} />;
};

export default {
  title: 'Shared/TwoFactorAuthForm',
  component: TwoFactorAuthForm,
};

export const Default = Template.bind({});
Default.args = { children: 'text' };
