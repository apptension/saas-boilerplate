import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillCrudDemoItemListQuery } from '../../../mocks/factories/crudDemoItem';
import { withProviders } from '../../../shared/utils/storybook';
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
