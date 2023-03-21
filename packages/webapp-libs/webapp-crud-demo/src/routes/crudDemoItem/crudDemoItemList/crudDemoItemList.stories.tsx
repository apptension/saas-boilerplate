import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillCrudDemoItemListQuery } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { CrudDemoItemList } from './crudDemoItemList.component';

const Template: Story = () => {
  return <CrudDemoItemList />;
};

export default {
  title: 'CrudDemoItem / CrudDemoItemList',
  component: CrudDemoItemList,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    apolloMocks: append(fillCrudDemoItemListQuery()),
  }),
];
