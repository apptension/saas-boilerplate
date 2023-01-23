import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router';

import { demoItemFactory, fillDemoItemsAllQuery, fillUseFavouriteDemoItemListQuery } from '../../../mocks/factories';
import { DemoItems } from '../demoItems.component';
import { getRelayEnv as getBaseRelayEnv } from '../../../tests/utils/relay';
import { RoutesConfig } from '../../../app/config/routes';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';

describe('DemoItems: Component', () => {
  const routePath = ['demoItems'];
  const detailsRoutePath = ['demoItem'];
  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<DemoItems />} />
      <Route path={RoutesConfig.getLocalePath(detailsRoutePath)} element={<span>DemoItem details page mock</span>} />
    </Routes>
  );

  const getRelayEnv = () => {
    const relayEnvironment = getBaseRelayEnv();
    const data = {
      items: [
        demoItemFactory({
          sys: { id: 'test-id-1' },
          title: 'First',
          image: { title: 'first image title', url: 'https://image.url' },
        }),
        demoItemFactory({
          sys: { id: 'test-id-2' },
          title: 'Second',
          image: { title: 'second image title', url: 'https://image.url' },
        }),
      ],
    };

    fillDemoItemsAllQuery(relayEnvironment, data);
    fillUseFavouriteDemoItemListQuery(relayEnvironment, { item: { pk: 'item-1' } });
    return relayEnvironment;
  };

  it('should render all items', async () => {
    const routerProps = createMockRouterProps(routePath);
    render(<Component />, { relayEnvironment: getRelayEnv(), routerProps });
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should open single demo item page when link is clicked', async () => {
    const routerProps = createMockRouterProps(routePath);
    render(<Component />, { relayEnvironment: getRelayEnv(), routerProps });
    expect(screen.getByText('First')).toBeInTheDocument();
    await userEvent.click(screen.getByText('First'));
    expect(screen.getByText('DemoItem details page mock')).toBeInTheDocument();
  });
});
