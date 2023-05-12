import { StoryFn } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as UserExportEmail,
  UserExportProps,
  Subject as UserExportSubject,
} from './userExport.component';

const Template: StoryFn<UserExportProps> = (args: UserExportProps) => (
  <EmailStory
    type={EmailTemplateType.ACCOUNT_ACTIVATION}
    subject={<UserExportSubject />}
    emailData={args}
  >
    <UserExportEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/UserExport',
  component: UserExportEmail,
};

export const Primary = {
  render: Template,

  args: {
    data: {
      user_id: 'test_user_id_1',
      export_url: 'export_url',
    },
  },
};
