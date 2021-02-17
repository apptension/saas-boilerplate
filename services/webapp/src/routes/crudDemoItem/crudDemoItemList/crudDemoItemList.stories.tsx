import React from 'react';
import { Story } from '@storybook/react';

import { crudDemoItemFactory } from '../../../mocks/factories';
import { prepareState } from '../../../mocks/store';
import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { CrudDemoItemList } from './crudDemoItemList.component';

const items = [crudDemoItemFactory(), crudDemoItemFactory(), crudDemoItemFactory()];

const store = prepareState((state) => {
  state.crudDemoItem.items = items;
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper context={{ store }}>
      <CrudDemoItemList {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'CrudDemoItem / CrudDemoItemList',
  component: CrudDemoItemList,
};

export const Default = Template.bind({});
