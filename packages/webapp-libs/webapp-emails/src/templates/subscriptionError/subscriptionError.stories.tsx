import { StoryFn } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as SubscriptionErrorEmail,
  Subject as SubscriptionErrorSubject,
} from './subscriptionError.component';

const Template: StoryFn = (args: Record<any, any>) => (
  <EmailStory
    type={EmailTemplateType.SUBSCRIPTION_ERROR}
    subject={<SubscriptionErrorSubject />}
    emailData={args}
  >
    <SubscriptionErrorEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/SubscriptionError',
  component: SubscriptionErrorEmail,
};

export const Primary = {
  render: Template,
  args: {},
};
