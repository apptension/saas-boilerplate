import { Story } from '@storybook/react';
import { Route, Routes } from 'react-router';
import { withProviders } from '../../../shared/utils/storybook';
import { RoutesConfig } from '../../../app/config/routes';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { createMockRouterProps } from '../../../tests/utils/rendering';
import { fillCrudDemoItemDetailsQuery } from '../../../mocks/factories/crudDemoItem';
import { composeMockedQueryResult } from '../../../tests/utils/fixtures';
import { CRUD_DEMO_ITEM_DETAILS_QUERY, CrudDemoItemDetails } from './crudDemoItemDetails.component';

const routePath = ['crudDemoItem', 'details'];
const defaultItemId = 'test-id';

const Template: Story = () => {
  return (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<CrudDemoItemDetails />} />
    </Routes>
  );
};

export default {
  title: 'CrudDemoItem / CrudDemoItemDetails',
  component: CrudDemoItemDetails,
};

export const Default = Template.bind({});
const variables = { id: defaultItemId };
const data = {
  name: 'Demo item name',
};
Default.decorators = [
  withProviders({
    routerProps: createMockRouterProps(routePath, variables),
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env);
      // todo: replace composeMockedQueryResult with fillCrudDemoItemDetailsQuery during relay removal
      fillCrudDemoItemDetailsQuery(env, data, variables);
    },
    apolloMocks: [
      composeMockedQueryResult(CRUD_DEMO_ITEM_DETAILS_QUERY, {
        variables: variables,
        data: {
          crudDemoItem: data,
        },
      }),
    ],
  }),
];
