import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockPayloadGenerator } from 'relay-test-utils';
import { Routes, Route } from 'react-router';

import { demoItemFactory } from '../../../mocks/factories';
import useFavoriteDemoItemListQueryGraphql from '../../../shared/hooks/useFavoriteDemoItem/__generated__/useFavoriteDemoItemListQuery.graphql';
import { DemoItems } from '../demoItems.component';
import demoItemsAllQueryGraphql from '../__generated__/demoItemsAllQuery.graphql';
import { getRelayEnv as getBaseRelayEnv } from '../../../tests/utils/relay';
import { RoutesConfig } from '../../../app/config/routes';
import { createMockRouterHistory, render } from '../../../tests/utils/rendering';

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
    relayEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        DemoItemCollection() {
          return {
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
        },
      })
    );
    relayEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ContentfulDemoItemFavoriteType: () => ({ item: { pk: 'item-1' } }),
      })
    );
    relayEnvironment.mock.queuePendingOperation(demoItemsAllQueryGraphql, {});
    relayEnvironment.mock.queuePendingOperation(useFavoriteDemoItemListQueryGraphql, {});
    return relayEnvironment;
  };

  it('should render all items', async () => {
    const routerHistory = createMockRouterHistory(routePath);
    render(<Component />, { relayEnvironment: getRelayEnv(), routerHistory });
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should open single demo item page when link is clicked', async () => {
    const routerHistory = createMockRouterHistory(routePath);
    render(<Component />, { relayEnvironment: getRelayEnv(), routerHistory });
    expect(screen.getByText('First')).toBeInTheDocument();
    await userEvent.click(screen.getByText('First'));
    expect(screen.getByText('DemoItem details page mock')).toBeInTheDocument();
  });
});
