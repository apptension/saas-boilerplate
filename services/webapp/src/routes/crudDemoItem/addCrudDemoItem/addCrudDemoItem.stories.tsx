import React from 'react';
import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { AddCrudDemoItem } from './addCrudDemoItem.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <AddCrudDemoItem {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'CrudDemoItem / AddCrudDemoItem',
  component: AddCrudDemoItem,
};

export const Default = Template.bind({});
