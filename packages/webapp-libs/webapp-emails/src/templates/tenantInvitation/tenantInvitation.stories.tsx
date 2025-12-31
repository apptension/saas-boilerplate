import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as TenantInvitationEmail,
  TenantInvitationProps,
  Subject as TenantInvitationSubject,
} from './tenantInvitation.component';

const Template: StoryFn<TenantInvitationProps> = (args: TenantInvitationProps) => (
  <EmailStory type={EmailTemplateType.TENANT_INVITATION} subject={<TenantInvitationSubject />} emailData={args}>
    <TenantInvitationEmail {...args} />
  </EmailStory>
);

const meta: Meta<typeof TenantInvitationEmail> = {
  title: 'Emails/TenantInvitation',
  component: TenantInvitationEmail,
  parameters: {
    docs: {
      description: {
        component: 'Email sent when a user is invited to join an organization.',
      },
    },
  },
  argTypes: {
    token: {
      description: 'Invitation token',
      control: 'text',
    },
    tenantMembershipId: {
      description: 'Membership ID for the invitation',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TenantInvitationEmail>;

export const Primary: Story = {
  render: Template,
  args: {
    token: 'invitation-token-abc123',
    tenantMembershipId: 'membership-12345',
  },
};

export const Mobile: Story = {
  render: Template,
  args: {
    token: 'invitation-token-abc123',
    tenantMembershipId: 'membership-12345',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
