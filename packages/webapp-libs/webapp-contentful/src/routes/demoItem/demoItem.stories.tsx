import { MockedResponse } from '@apollo/client/testing';
import * as corePath from '@sb/webapp-core/utils/path';
import { Meta, StoryContext, StoryFn, StoryObj } from '@storybook/react';
import { GraphQLError } from 'graphql';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../config/routes';
import { demoItemFactory, fillDemoItemQuery } from '../../tests/factories';
import { createMockRouterProps } from '../../tests/utils/rendering';
import { withProviders } from '../../utils/storybook';
import { DemoItem } from './demoItem.component';
import { demoItemQuery } from './demoItem.graphql';

const defaultItemId = 'test-id';

const Template: StoryFn = () => {
  return (
    <Routes>
      <Route
        path={corePath.getLocalePath(RoutesConfig.demoItem)}
        element={<DemoItem routesConfig={{ notFound: '/not-found', list: RoutesConfig.demoItems }} />}
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
      apolloMocks: ((mocks: readonly MockedResponse[], storyContext?: StoryContext) => append(fillDemoItemQuery(demoItemFactory(), { id: defaultItemId }), mocks) as readonly MockedResponse[]) as any,
    }),
  ],
};

const networkErrorMock: MockedResponse = {
  request: {
    query: demoItemQuery,
    variables: { id: defaultItemId },
  },
  error: new Error('Failed to fetch'),
};

export const NotConfigured: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      routerProps: createMockRouterProps(RoutesConfig.demoItem, {
        id: defaultItemId,
      }),
      apolloMocks: ((mocks: readonly MockedResponse[], storyContext?: StoryContext) => append(networkErrorMock, mocks) as readonly MockedResponse[]) as any,
    }),
  ],
};

const graphqlErrorMock: MockedResponse = {
  request: {
    query: demoItemQuery,
    variables: { id: defaultItemId },
  },
  result: {
    errors: [new GraphQLError('Item not found')],
  },
};

export const WithError: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      routerProps: createMockRouterProps(RoutesConfig.demoItem, {
        id: defaultItemId,
      }),
      apolloMocks: ((mocks: readonly MockedResponse[], storyContext?: StoryContext) => append(graphqlErrorMock, mocks) as readonly MockedResponse[]) as any,
    }),
  ],
};
