import { StoryFn } from '@storybook/react';
import closeIcon from '@iconify-icons/ion/close-outline';
import { Icon, IconProps } from './icon.component';

const Template: StoryFn<IconProps> = (args: IconProps) => {
  return <Icon {...args} />;
};

export default {
  title: 'Core/Icon',
  component: Icon,
};

export const Close = {
  render: Template,
  args: { icon: closeIcon },
};
