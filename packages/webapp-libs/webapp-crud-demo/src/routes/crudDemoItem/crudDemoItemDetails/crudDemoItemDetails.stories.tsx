import { getLocalePath } from '@sb/webapp-core/utils';
import { StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { fillCrudDemoItemDetailsQuery } from '../../../tests/factories';
import { createMockRouterProps } from '../../../tests/utils/rendering';
import { withProviders } from '../../../utils/storybook';
import { CrudDemoItemDetails } from './crudDemoItemDetails.component';

const defaultItemId = 'test-id';

const Template: StoryFn = () => {
  return (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.details)} element={<CrudDemoItemDetails />} />
    </Routes>
  );
};

export default {
  title: 'Crud Demo Item / CrudDemoItemDetails',
  component: CrudDemoItemDetails,
};

const variables = { id: defaultItemId };
const data = {
  name: 'Demo item name',
};

export const Default: StoryObj = {
  render: Template,

  decorators: [
    withProviders({
      routerProps: createMockRouterProps(RoutesConfig.crudDemoItem.details, variables),
      apolloMocks: append(fillCrudDemoItemDetailsQuery(data, variables)),
    }),
  ],
};
