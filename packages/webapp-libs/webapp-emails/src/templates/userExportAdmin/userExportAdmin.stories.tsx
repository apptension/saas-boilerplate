import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as UserExportAdminEmail,
  UserExportAdminProps,
  Subject as UserExportAdminSubject,
} from './userExportAdmin.component';

const Template: StoryFn<UserExportAdminProps> = (args: UserExportAdminProps) => (
  <EmailStory type={EmailTemplateType.USER_EXPORT_ADMIN} subject={<UserExportAdminSubject />} emailData={args}>
    <UserExportAdminEmail {...args} />
  </EmailStory>
);

const meta: Meta<typeof UserExportAdminEmail> = {
  title: 'Emails/UserExportAdmin',
  component: UserExportAdminEmail,
  parameters: {
    docs: {
      description: {
        component: 'Admin email containing a summary of all user data exports with download links.',
      },
    },
  },
  argTypes: {
    data: {
      description: 'Array of user export results with email and download URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserExportAdminEmail>;

export const Primary: Story = {
  render: Template,
  args: {
    data: [
      {
        email: 'john.doe@example.com',
        export_url: 'https://example.com/exports/john-doe-data.zip',
      },
      {
        email: 'jane.smith@example.com',
        export_url: 'https://example.com/exports/jane-smith-data.zip',
      },
      {
        email: 'bob.wilson@example.com',
        export_url: 'https://example.com/exports/bob-wilson-data.zip',
      },
    ],
  },
};

export const Mobile: Story = {
  render: Template,
  args: {
    data: [
      {
        email: 'john.doe@example.com',
        export_url: 'https://example.com/exports/john-doe-data.zip',
      },
      {
        email: 'jane.smith@example.com',
        export_url: 'https://example.com/exports/jane-smith-data.zip',
      },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const SingleUser: Story = {
  render: Template,
  args: {
    data: [
      {
        email: 'single.user@example.com',
        export_url: 'https://example.com/exports/single-user-data.zip',
      },
    ],
  },
};
