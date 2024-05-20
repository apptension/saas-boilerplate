import { StoryFn } from '@storybook/react';

import { EmailTemplateType } from '../../types';
import { EmailStory } from '../../emailStory/emailStory.component';
import {
  Template as TenantInvitationEmail,
  Subject as TenantInvitationSubject,
  TenantInvitationProps,
} from './tenantInvitation.component';

const Template: StoryFn<TenantInvitationProps> = (args) => (
  <EmailStory type={EmailTemplateType.TENANT_INVITATION} subject={<TenantInvitationSubject />} emailData={args}>
    <TenantInvitationEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/TenantInvitation',
  component: TenantInvitationEmail,
};

export const Primary = Template.bind({});
Primary.args = {};
