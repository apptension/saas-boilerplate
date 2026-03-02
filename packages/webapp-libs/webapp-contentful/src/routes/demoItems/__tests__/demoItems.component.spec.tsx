import { getLocalePath } from '@sb/webapp-core/utils/path';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { demoItemFactory, fillDemoItemsAllQuery, fillUseFavouriteDemoItemListQuery } from '../../../tests/factories';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { demoItemsAllQuery } from '../demoItems.graphql';
import { DemoItems } from '../demoItems.component';

const mockedItems = [
  {
    ...demoItemFactory({
      sys: { id: 'test-id-1' },
      title: 'First',
      image: { title: 'first image title', url: 'https://image.url' },
    }),
  },
  {
    ...demoItemFactory({
      sys: { id: 'test-id-2' },
      title: 'Second',
      image: { title: 'second image title', url: 'https://image.url' },
    }),
  },
];
const getApolloMocks = () => [
  fillDemoItemsAllQuery(mockedItems),
  fillUseFavouriteDemoItemListQuery([
    {
      item: { pk: 'item-1' },
    },
  ]),
];

describe('DemoItems: Component', () => {
  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.demoItems)} element={<DemoItems />} />
      <Route path={getLocalePath(RoutesConfig.demoItem)} element={<span>DemoItem details page mock</span>} />
    </Routes>
  );

  it('should render all items', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);

    const { waitForApolloMocks } = render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(getApolloMocks()),
    });
    await waitForApolloMocks();

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should render page title and description', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);

    const { waitForApolloMocks } = render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(getApolloMocks()),
    });
    await waitForApolloMocks();

    expect(screen.getByRole('heading', { name: /content items/i })).toBeInTheDocument();
    expect(screen.getByText(/contentful headless cms/i)).toBeInTheDocument();
  });

  it('should render items in a card with proper header', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);

    const { waitForApolloMocks } = render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(getApolloMocks()),
    });
    await waitForApolloMocks();

    expect(screen.getByText(/items managed in contentful cms/i)).toBeInTheDocument();
  });

  it('should open single demo item page when link is clicked', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);

    const { waitForApolloMocks } = render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(getApolloMocks()),
    });
    await waitForApolloMocks();

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('First')).toBeInTheDocument();
    await userEvent.click(screen.getByText('First'));
    expect(screen.getByText('DemoItem details page mock')).toBeInTheDocument();
  });

  it('should render empty state when no items exist', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);
    const emptyMocks = [
      fillDemoItemsAllQuery([]),
      fillUseFavouriteDemoItemListQuery([]),
    ];

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat(emptyMocks),
    });

    expect(await screen.findByText(/no content items found/i)).toBeInTheDocument();
    expect(screen.getByText(/open contentful dashboard/i)).toBeInTheDocument();
  });

  it('should render error state on query error', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);
    const errorMock = {
      request: {
        query: demoItemsAllQuery,
      },
      error: new Error('Test error message'),
    };

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat([errorMock, fillUseFavouriteDemoItemListQuery([])]),
    });

    await waitFor(() => {
      expect(screen.getByText(/unable to load content items/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should render not configured state when network error occurs', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);
    const networkErrorMock = {
      request: {
        query: demoItemsAllQuery,
      },
      error: new Error('Failed to fetch'),
    };

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) =>
        defaultMocks.concat([networkErrorMock, fillUseFavouriteDemoItemListQuery([])]),
    });

    await waitFor(() => {
      expect(screen.getByText(/contentful integration not configured/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/to enable this feature/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check again/i })).toBeInTheDocument();
  });

  it('should refetch when check again button is clicked in not configured state', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);
    const networkErrorMock = {
      request: {
        query: demoItemsAllQuery,
      },
      error: new Error('Failed to fetch'),
    };
    const successMocks = getApolloMocks();

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat([networkErrorMock, ...successMocks]),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /check again/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /check again/i }));

    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should refetch when try again button is clicked in error state', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.demoItems);
    const errorMock = {
      request: {
        query: demoItemsAllQuery,
      },
      error: new Error('Test error'),
    };
    const successMocks = getApolloMocks();

    render(<Component />, {
      routerProps,
      apolloMocks: (defaultMocks) => defaultMocks.concat([errorMock, ...successMocks]),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
