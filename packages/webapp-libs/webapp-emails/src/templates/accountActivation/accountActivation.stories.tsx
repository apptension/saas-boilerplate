import { StoryFn } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as AccountActivationEmail,
  AccountActivationProps,
  Subject as AccountActivationSubject,
} from './accountActivation.component';

const Template: StoryFn<AccountActivationProps> = (
  args: AccountActivationProps
) => (
  <EmailStory
    type={EmailTemplateType.ACCOUNT_ACTIVATION}
    subject={<AccountActivationSubject />}
    emailData={args}
  >
    <AccountActivationEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/AccountActivation',
  component: AccountActivationEmail,
};

export const Primary = {
  render: Template,

  args: {
    token: 'token-value',
    userId: 'user-id',
  },
};
