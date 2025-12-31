import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import { Template as SubscriptionErrorEmail, Subject as SubscriptionErrorSubject } from './subscriptionError.component';

const Template: StoryFn = () => (
  <EmailStory type={EmailTemplateType.SUBSCRIPTION_ERROR} subject={<SubscriptionErrorSubject />} emailData={{}}>
    <SubscriptionErrorEmail />
  </EmailStory>
);

const meta: Meta<typeof SubscriptionErrorEmail> = {
  title: 'Emails/SubscriptionError',
  component: SubscriptionErrorEmail,
  parameters: {
    docs: {
      description: {
        component: 'Email sent when a subscription payment fails.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SubscriptionErrorEmail>;

export const Primary: Story = {
  render: Template,
};

export const Mobile: Story = {
  render: Template,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
