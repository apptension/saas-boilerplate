import { Story } from '@storybook/react';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { fillCrudDemoItemDetailsQuery } from '../../../mocks/factories/crudDemoItem';
import { withProviders } from '../../../shared/utils/storybook';
import { createMockRouterProps } from '../../../tests/utils/rendering';
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
const variables = { id: defaultItemId };
const data = {
  name: 'Demo item name',
};
Default.decorators = [
  withProviders({
    routerProps: createMockRouterProps(routePath, variables),
    apolloMocks: append(fillCrudDemoItemDetailsQuery(undefined, data, variables)),
  }),
];
