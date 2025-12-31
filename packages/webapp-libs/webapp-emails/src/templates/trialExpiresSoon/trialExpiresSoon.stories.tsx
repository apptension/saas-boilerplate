import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as TrialExpiresSoonEmail,
  TrialExpiresSoonProps,
  Subject as TrialExpiresSoonSubject,
} from './trialExpiresSoon.component';

const Template: StoryFn<TrialExpiresSoonProps> = (args: TrialExpiresSoonProps) => (
  <EmailStory type={EmailTemplateType.TRIAL_EXPIRES_SOON} subject={<TrialExpiresSoonSubject />} emailData={args}>
    <TrialExpiresSoonEmail {...args} />
  </EmailStory>
);

const meta: Meta<typeof TrialExpiresSoonEmail> = {
  title: 'Emails/TrialExpiresSoon',
  component: TrialExpiresSoonEmail,
  parameters: {
    docs: {
      description: {
        component: 'Email sent when a trial period is about to expire.',
      },
    },
  },
  argTypes: {
    expiryDate: {
      description: 'Trial expiration date',
      control: 'date',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrialExpiresSoonEmail>;

// Get a date 3 days from now for a realistic expiry date
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 3);

export const Primary: Story = {
  render: Template,
  args: {
    expiryDate: futureDate.toISOString(),
  },
};

export const Mobile: Story = {
  render: Template,
  args: {
    expiryDate: futureDate.toISOString(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
