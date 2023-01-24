import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { fillCrudDemoItemListQuery } from '../../../mocks/factories/crudDemoItem';
import { composeMockedListQueryResult } from '../../../tests/utils/fixtures';
import { CRUD_DEMO_ITEM_LIST_QUERY, CrudDemoItemList } from './crudDemoItemList.component';

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
      // todo: replace composeMockedQueryResult with fillCrudDemoItemDetailsQuery during relay removal
      fillCrudDemoItemListQuery(env);
    },
    apolloMocks: [
      composeMockedListQueryResult(CRUD_DEMO_ITEM_LIST_QUERY, 'allCrudDemoItems', 'CrudDemoItemType', {
        data: [
          { id: 1, name: 'First item' },
          { id: 2, name: 'Second item' },
        ],
      }),
    ],
  }),
];
