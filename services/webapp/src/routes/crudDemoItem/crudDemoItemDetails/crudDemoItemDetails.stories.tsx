import { Story } from '@storybook/react';
import { Route, Routes } from 'react-router';
import { withProviders } from '../../../shared/utils/storybook';
import { RoutesConfig } from '../../../app/config/routes';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { createMockRouterProps } from '../../../tests/utils/rendering';
import { fillCrudDemoItemDetailsQuery } from '../../../mocks/factories/crudDemoItem';
import { CrudDemoItemDetails } from './crudDemoItemDetails.component';

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
Default.decorators = [
  withProviders({
    routerProps: createMockRouterProps(routePath, { id: defaultItemId }),
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env);
      fillCrudDemoItemDetailsQuery(
        env,
        {
          name: 'Demo item name',
        },
        { id: defaultItemId }
      );
    },
  }),
];
