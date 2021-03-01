import React from 'react';
import { Story } from '@storybook/react';
import closeIcon from '@iconify-icons/ion/close-outline';
import { Icon, IconProps } from './icon.component';

const Template: Story<IconProps> = (args) => {
  return <Icon {...args} />;
};

export default {
  title: 'Shared/Icon',
  component: Icon,
};

export const Close = Template.bind({});
Close.args = { icon: closeIcon };
