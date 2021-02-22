import React from 'react';
import { Story } from '@storybook/react';
import { EmailTemplateType } from '../../types';
import { EmailStory } from '../../emailStory/emailStory.component';
import {
  Template as AccountActivationEmail,
  Subject as AccountActivationSubject,
  AccountActivationProps,
} from './accountActivation.component';

const Template: Story<AccountActivationProps> = (args) => (
  <EmailStory type={EmailTemplateType.AccountActivation} subject={<AccountActivationSubject />} emailData={args}>
    <AccountActivationEmail {...args} />
  </EmailStory>
);

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
