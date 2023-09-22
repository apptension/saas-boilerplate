import { getLocalePath } from '@sb/webapp-core/utils/path';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../config/routes';
import { demoItemFactory, fillDemoItemsAllQuery, fillUseFavouriteDemoItemListQuery } from '../../../tests/factories';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
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
});
