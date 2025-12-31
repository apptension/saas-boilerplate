import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import { Template as UserExportEmail, UserExportProps, Subject as UserExportSubject } from './userExport.component';

const Template: StoryFn<UserExportProps> = (args: UserExportProps) => (
  <EmailStory type={EmailTemplateType.USER_EXPORT} subject={<UserExportSubject />} emailData={args}>
    <UserExportEmail {...args} />
  </EmailStory>
);

const meta: Meta<typeof UserExportEmail> = {
  title: 'Emails/UserExport',
  component: UserExportEmail,
  parameters: {
    docs: {
      description: {
        component: 'Email sent to users with a link to download their exported personal data (GDPR compliance).',
      },
    },
  },
  argTypes: {
    data: {
      description: 'User export data containing email and download URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserExportEmail>;

export const Primary: Story = {
  render: Template,
  args: {
    data: {
      email: 'user@example.com',
      export_url: 'https://example.com/exports/user-data-12345.zip',
    },
  },
};

export const Mobile: Story = {
  render: Template,
  args: {
    data: {
      email: 'user@example.com',
      export_url: 'https://example.com/exports/user-data-12345.zip',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
