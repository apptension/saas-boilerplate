import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { DemoItemListItem, DemoItemListItemProps } from './demoItemListItem.component';

const Template: Story<DemoItemListItemProps> = (args) => {
  return (
    <ProvidersWrapper>
      <DemoItemListItem {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'ContentfulDemo / DemoItemListItem',
  component: DemoItemListItem,
};

export const Default = Template.bind({});
Default.args = { id: 'id1', title: 'Example title' };
