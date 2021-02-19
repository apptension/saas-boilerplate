import React from 'react';
import { Story } from '@storybook/react';
import { Template as AccountActivationEmail, AccountActivationProps } from './accountActivation.component';

const Template: Story<AccountActivationProps> = (args) => <AccountActivationEmail {...args} />;

export default {
  title: 'Emails/AccountActivation',
  component: AccountActivationEmail,
};

export const Primary = Template.bind({});
Primary.args = {
  webAppUrl: 'http://localhost:3000',
  token: 'token-value',
  userId: 'user-id',
};
