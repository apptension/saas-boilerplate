import { Story } from '@storybook/react';
import { EmailTemplateType } from '../../types';
import { EmailStory } from '../../emailStory/emailStory.component';
import {
  Template as AccountActivationEmail,
  Subject as AccountActivationSubject,
  AccountActivationProps,
} from './accountActivation.component';

const Template: Story<AccountActivationProps> = (args: AccountActivationProps) => (
  <EmailStory type={EmailTemplateType.ACCOUNT_ACTIVATION} subject={<AccountActivationSubject />} emailData={args}>
    <AccountActivationEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/AccountActivation',
  component: AccountActivationEmail,
};

export const Primary = Template.bind({});
Primary.args = {
  token: 'token-value',
  userId: 'user-id',
};
