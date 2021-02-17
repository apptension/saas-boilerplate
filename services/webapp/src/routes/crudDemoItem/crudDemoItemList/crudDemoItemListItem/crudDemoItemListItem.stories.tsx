import React from 'react';
import { Story } from '@storybook/react';

import { crudDemoItemFactory } from '../../../../mocks/factories';
import { ProvidersWrapper } from '../../../../shared/utils/testUtils';
import { CrudDemoItemListItem } from './crudDemoItemListItem.component';

const item = crudDemoItemFactory();

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <CrudDemoItemListItem item={item} {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'CrudDemoItem / CrudDemoItemListItem',
  component: CrudDemoItemListItem,
};

export const Default = Template.bind({});
Default.args = { item };
