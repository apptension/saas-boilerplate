import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { BackButton, BackButtonProps } from './backButton.component';

const Template: StoryFn<BackButtonProps> = (args: BackButtonProps) => <BackButton {...args} />;

export default {
  title: 'Core/BackButton',
  component: BackButton,
  decorators: [withProviders()],
};

export const Primary = Template.bind({});
Primary.args = { to: '#' };
