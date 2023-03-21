import { getLocalePath } from '@sb/webapp-core/utils';
import { Story } from '@storybook/react';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { fillEditCrudDemoItemQuery } from '../../../tests/factories';
import { createMockRouterProps } from '../../../tests/utils/rendering';
import { withProviders } from '../../../utils/storybook';
import { EditCrudDemoItem } from './editCrudDemoItem.component';

const defaultItemId = 'test-id';

const Template: Story = () => {
  return (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.edit)} element={<EditCrudDemoItem />} />
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
    apolloMocks: append(
      fillEditCrudDemoItemQuery(
        {
          name: 'Default name',
        },
        { id: defaultItemId }
      )
    ),
    routerProps: createMockRouterProps(RoutesConfig.crudDemoItem.edit, { id: defaultItemId }),
  }),
];
