import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockPayloadGenerator } from 'relay-test-utils';

import { makeContextRenderer, packHistoryArgs, spiedHistory } from '../../../shared/utils/testUtils';
import { demoItemFactory } from '../../../mocks/factories';
import useFavoriteDemoItemListQueryGraphql from '../../../shared/hooks/useFavoriteDemoItem/__generated__/useFavoriteDemoItemListQuery.graphql';
import { DemoItems } from '../demoItems.component';
import demoItemsAllQueryGraphql from '../__generated__/demoItemsAllQuery.graphql';
import { getRelayEnv as getBaseRelayEnv } from '../../../tests/utils/relay';

describe('DemoItems: Component', () => {
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

  const component = () => <DemoItems />;
  const render = makeContextRenderer(component);

  it('should render all items', async () => {
    render({}, { relayEnvironment: getRelayEnv() });
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should open single demo item page when link is clicked', async () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { relayEnvironment: getRelayEnv(), router: { history } });
    expect(screen.getByText('First')).toBeInTheDocument();
    await userEvent.click(screen.getByText('First'));
    expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/demo-items/test-id-1'));
  });
});
