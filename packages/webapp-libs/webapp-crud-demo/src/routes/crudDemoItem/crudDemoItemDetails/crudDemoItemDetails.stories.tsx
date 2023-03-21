import { getLocalePath } from '@sb/webapp-core/utils';
import { Story } from '@storybook/react';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { fillCrudDemoItemDetailsQuery } from '../../../tests/factories';
import { createMockRouterProps } from '../../../tests/utils/rendering';
import { withProviders } from '../../../utils/storybook';
import { CrudDemoItemDetails } from './crudDemoItemDetails.component';

const defaultItemId = 'test-id';

const Template: Story = () => {
  return (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.details)} element={<CrudDemoItemDetails />} />
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
    routerProps: createMockRouterProps(RoutesConfig.crudDemoItem.details, variables),
    apolloMocks: append(fillCrudDemoItemDetailsQuery(data, variables)),
  }),
];
