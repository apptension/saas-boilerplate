import { getLocalePath } from '@sb/webapp-core/utils/path';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { append } from 'ramda';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { demoItemFactory, fillDemoItemQuery } from '../../../tests/factories';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { demoItemQuery } from '../demoItem.graphql';
import { DemoItem } from '../demoItem.component';

describe('DemoItem: Component', () => {
  const demoItem = demoItemFactory({
    title: 'First',
    description: 'Something more',
    image: {
      description: 'Image',
    },
  });

  const Component = () => (
    <Routes>
      <Route
        path={getLocalePath(RoutesConfig.demoItem)}
        element={<DemoItem routesConfig={{ notFound: '/not-found', list: RoutesConfig.demoItems }} />}
      />
    </Routes>
  );

  it('should render item data', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItem, { id: 'test-id' });
    const requestMock = fillDemoItemQuery(demoItem, { id: 'test-id' });

    const imageTitle = demoItem.image?.title as string;

    render(<Component />, {
      apolloMocks: append(requestMock),
      routerProps,
    });

    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByText('Something more')).toBeInTheDocument();
    expect(screen.getByAltText(imageTitle)).toBeInTheDocument();
  });

  it('should render back link to content items', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItem, { id: 'test-id' });
    const requestMock = fillDemoItemQuery(demoItem, { id: 'test-id' });

    render(<Component />, {
      apolloMocks: append(requestMock),
      routerProps,
    });

    expect(await screen.findByText(/back to content items/i)).toBeInTheDocument();
  });

  it('should render loading skeleton when loading', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItem, { id: 'test-id' });
    const requestMock = {
      ...fillDemoItemQuery(demoItem, { id: 'test-id' }),
      delay: 200,
    };

    render(<Component />, {
      apolloMocks: append(requestMock),
      routerProps,
    });

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(await screen.findByText('First')).toBeInTheDocument();
  });

  it('should render error state on query error', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItem, { id: 'test-id' });
    const errorMock = {
      request: {
        query: demoItemQuery,
        variables: { id: 'test-id' },
      },
      error: new Error('Test error message'),
    };

    render(<Component />, {
      apolloMocks: append(errorMock),
      routerProps,
    });

    await waitFor(() => {
      expect(screen.getByText(/unable to load content item/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should render not configured state when network error occurs', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItem, { id: 'test-id' });
    const networkErrorMock = {
      request: {
        query: demoItemQuery,
        variables: { id: 'test-id' },
      },
      error: new Error('Failed to fetch'),
    };

    render(<Component />, {
      apolloMocks: append(networkErrorMock),
      routerProps,
    });

    await waitFor(() => {
      expect(screen.getByText(/contentful not configured/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/return to list/i)).toBeInTheDocument();
  });

  it('should refetch when retry button is clicked', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItem, { id: 'test-id' });
    const errorMock = {
      request: {
        query: demoItemQuery,
        variables: { id: 'test-id' },
      },
      error: new Error('Test error'),
    };
    const successMock = fillDemoItemQuery(demoItem, { id: 'test-id' });

    render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat([errorMock, successMock]),
      routerProps,
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText('First')).toBeInTheDocument();
  });
});
