import { Story } from '@storybook/react';
import { Route, Routes } from 'react-router';

import { demoItemFactory, fillDemoItemQuery } from '../../mocks/factories';
import { withProviders } from '../../shared/utils/storybook';
import { createMockRouterProps } from '../../tests/utils/rendering';
import { RoutesConfig } from '../../app/config/routes';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
import { DemoItem } from './demoItem.component';

const routePath = ['demoItem'];
const defaultItemId = 'test-id';

const Template: Story = () => {
  return (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<DemoItem />} />
    </Routes>
  );
};

export default {
  title: 'ContentfulDemo / DemoItem',
  component: DemoItem,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    routerProps: createMockRouterProps(routePath, { id: defaultItemId }),
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env);
      fillDemoItemQuery(env, demoItemFactory(), { id: defaultItemId });
    },
  }),
];
