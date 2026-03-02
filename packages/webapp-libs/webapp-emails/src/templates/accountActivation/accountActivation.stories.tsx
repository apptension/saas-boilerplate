import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as AccountActivationEmail,
  AccountActivationProps,
  Subject as AccountActivationSubject,
} from './accountActivation.component';

const Template: StoryFn<AccountActivationProps> = (args: AccountActivationProps) => (
  <EmailStory type={EmailTemplateType.ACCOUNT_ACTIVATION} subject={<AccountActivationSubject />} emailData={args}>
    <AccountActivationEmail {...args} />
  </EmailStory>
);

const meta: Meta<typeof AccountActivationEmail> = {
  title: 'Emails/AccountActivation',
  component: AccountActivationEmail,
  parameters: {
    docs: {
      description: {
        component: 'Email sent to users to confirm their email address during registration.',
      },
    },
  },
  argTypes: {
    token: {
      description: 'Activation token for email confirmation',
      control: 'text',
    },
    userId: {
      description: 'User ID for the activation link',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AccountActivationEmail>;

export const Primary: Story = {
  render: Template,
  args: {
    token: 'abc123-activation-token',
    userId: 'user-12345',
  },
};

export const Mobile: Story = {
  render: Template,
  args: {
    token: 'abc123-activation-token',
    userId: 'user-12345',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
