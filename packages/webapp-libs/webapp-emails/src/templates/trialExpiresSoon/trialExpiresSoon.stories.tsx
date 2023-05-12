import { StoryFn } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as TrialExpiresSoonEmail,
  TrialExpiresSoonProps,
  Subject as TrialExpiresSoonSubject,
} from './trialExpiresSoon.component';

const Template: StoryFn<TrialExpiresSoonProps> = (
  args: TrialExpiresSoonProps
) => (
  <EmailStory
    type={EmailTemplateType.TRIAL_EXPIRES_SOON}
    subject={<TrialExpiresSoonSubject />}
    emailData={args}
  >
    <TrialExpiresSoonEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/TrialExpiresSoon',
  component: TrialExpiresSoonEmail,
};

export const Primary = {
  render: Template,

  args: {
    expiryDate: '10/10/2020',
  },
};
