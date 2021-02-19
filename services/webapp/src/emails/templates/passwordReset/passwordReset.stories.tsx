import React from 'react';
import { Story } from '@storybook/react';
import { Template as PasswordResetEmail, PasswordResetProps } from './passwordReset.component';

const Template: Story<PasswordResetProps> = (args) => <PasswordResetEmail {...args} />;

export default {
  title: 'Emails/PasswordReset',
  component: PasswordResetEmail,
};

export const Primary = Template.bind({});
Primary.args = {
  webAppUrl: 'http://localhost:3000',
  token: 'token-value',
  userId: 'user-id',
};
