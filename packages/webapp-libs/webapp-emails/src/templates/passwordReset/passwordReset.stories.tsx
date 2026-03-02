import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as PasswordResetEmail,
  PasswordResetProps,
  Subject as PasswordResetSubject,
} from './passwordReset.component';

const Template: StoryFn<PasswordResetProps> = (args: PasswordResetProps) => (
  <EmailStory type={EmailTemplateType.PASSWORD_RESET} subject={<PasswordResetSubject />} emailData={args}>
    <PasswordResetEmail {...args} />
  </EmailStory>
);

const meta: Meta<typeof PasswordResetEmail> = {
  title: 'Emails/PasswordReset',
  component: PasswordResetEmail,
  parameters: {
    docs: {
      description: {
        component: 'Email sent to users when they request a password reset.',
      },
    },
  },
  argTypes: {
    token: {
      description: 'Password reset token',
      control: 'text',
    },
    userId: {
      description: 'User ID for the reset link',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordResetEmail>;

export const Primary: Story = {
  render: Template,
  args: {
    token: 'reset-token-xyz789',
    userId: 'user-12345',
  },
};

export const Mobile: Story = {
  render: Template,
  args: {
    token: 'reset-token-xyz789',
    userId: 'user-12345',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
