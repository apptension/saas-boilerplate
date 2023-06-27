import * as corePath from '@sb/webapp-core/utils/path';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../config/routes';
import { demoItemFactory, fillDemoItemQuery } from '../../tests/factories';
import { createMockRouterProps } from '../../tests/utils/rendering';
import { withProviders } from '../../utils/storybook';
import { DemoItem } from './demoItem.component';

const defaultItemId = 'test-id';

const Template: StoryFn = () => {
  return (
    <Routes>
      <Route
        path={corePath.getLocalePath(RoutesConfig.demoItem)}
        element={<DemoItem routesConfig={{ notFound: '/not-found' }} />}
      />
    </Routes>
  );
};
const meta: Meta = {
  title: 'Contentful Demo / DemoItem',
  component: DemoItem,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      routerProps: createMockRouterProps(RoutesConfig.demoItem, {
        id: defaultItemId,
      }),
      apolloMocks: append(fillDemoItemQuery(demoItemFactory(), { id: defaultItemId })),
    }),
  ],
};
