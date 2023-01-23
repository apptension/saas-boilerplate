import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { fillCrudDemoItemListQuery } from '../../../mocks/factories/crudDemoItem';
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
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env);
      fillCrudDemoItemListQuery(env);
    },
  }),
];
