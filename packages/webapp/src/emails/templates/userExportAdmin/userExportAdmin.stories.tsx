import { Story } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as UserExportAdminEmail,
  UserExportAdminProps,
  Subject as UserExportAdminSubject,
} from './userExportAdmin.component';

const Template: Story<UserExportAdminProps> = (args: UserExportAdminProps) => (
  <EmailStory type={EmailTemplateType.ACCOUNT_ACTIVATION} subject={<UserExportAdminSubject />} emailData={args}>
    <UserExportAdminEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/UserExportAdmin',
  component: UserExportAdminEmail,
};

export const Primary = Template.bind({});
Primary.args = {
  data: [
    {
      email: 'email1@example.com',
      export_url: 'export_url',
    },
    {
      email: 'email2@example.com',
      export_url: 'export_url',
    },
  ],
};
