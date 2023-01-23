import { Story } from '@storybook/react';
import { Route, Routes } from 'react-router';
import { withProviders } from '../../../shared/utils/storybook';
import { RoutesConfig } from '../../../app/config/routes';
import { createMockRouterProps } from '../../../tests/utils/rendering';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { fillEditCrudDemoItemQuery } from '../../../mocks/factories/crudDemoItem';
import { EditCrudDemoItem } from './editCrudDemoItem.component';

const routePath = ['crudDemoItem', 'edit'];
const defaultItemId = 'test-id';

const Template: Story = () => {
  return (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<EditCrudDemoItem />} />
    </Routes>
  );
};

export default {
  title: 'CrudDemoItem / EditCrudDemoItem',
  component: EditCrudDemoItem,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    routerProps: createMockRouterProps(routePath, { id: defaultItemId }),
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env);
      fillEditCrudDemoItemQuery(
        env,
        {
          name: 'Default name',
        },
        { id: defaultItemId }
      );
    },
  }),
];
