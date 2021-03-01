import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../utils/testUtils';
import { Sidebar } from './sidebar.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <Sidebar {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Sidebar',
  component: Sidebar,
};

export const Default = Template.bind({});
Default.args = {};
