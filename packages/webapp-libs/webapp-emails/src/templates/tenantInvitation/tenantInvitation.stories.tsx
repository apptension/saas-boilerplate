import { StoryFn } from '@storybook/react';

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

export default {
  title: 'Emails/TenantInvitation',
  component: TenantInvitationEmail,
};

export const Primary = {
  render: Template,

  args: {
    token: 'sample-token',
    tenantMembershipId: 'sample-membership-id',
  },
};
