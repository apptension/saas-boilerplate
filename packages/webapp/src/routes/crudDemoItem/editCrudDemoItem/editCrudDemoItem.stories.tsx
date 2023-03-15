import { Story } from '@storybook/react';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { fillEditCrudDemoItemQuery } from '../../../tests/factories/crudDemoItem';
import { withProviders } from '../../../shared/utils/storybook';
import { createMockRouterProps } from '../../../tests/utils/rendering';
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
    apolloMocks: append(
      fillEditCrudDemoItemQuery(
        {
          name: 'Default name',
        },
        { id: defaultItemId }
      )
    ),
    routerProps: createMockRouterProps(routePath, { id: defaultItemId }),
  }),
];
