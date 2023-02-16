import { Story } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import { Template as UserExportEmail, UserExportProps, Subject as UserExportSubject } from './userExport.component';

const Template: Story<UserExportProps> = (args: UserExportProps) => (
  <EmailStory type={EmailTemplateType.ACCOUNT_ACTIVATION} subject={<UserExportSubject />} emailData={args}>
    <UserExportEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/UserExport',
  component: UserExportEmail,
};

export const Primary = Template.bind({});
Primary.args = {
  data: {
    user_id: 'test_user_id_1',
    export_url: 'export_url',
  },
};
