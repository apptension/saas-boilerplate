import { Story } from '@storybook/react';
import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import { Subject as SubscriptionErrorSubject, Template as SubscriptionErrorEmail } from './subscriptionError.component';

const Template: Story = (args: Record<any, any>) => (
  <EmailStory type={EmailTemplateType.SUBSCRIPTION_ERROR} subject={<SubscriptionErrorSubject />} emailData={args}>
    <SubscriptionErrorEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/SubscriptionError',
  component: SubscriptionErrorEmail,
};

export const Primary = Template.bind({});
Primary.args = {};
