import { Suspense } from 'react';
import {act, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import demoItemListItemTestQueryGraphql, {
  demoItemListItemTestQuery,
} from '../../../../__generated__/demoItemListItemTestQuery.graphql';
import { ContextData, makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { demoItemFactory } from '../../../../mocks/factories';
import { generateRelayEnvironment } from '../../../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.fixtures';
import { DemoItemListItem, DemoItemListItemProps } from '../demoItemListItem.component';
import { useFavoriteDemoItemsLoader } from '../../../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.hook';
import favoriteDemoItemListQueryGraphql from '../../../../__generated__/useFavoriteDemoItemListQuery.graphql';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('DemoItemListItem: Component', () => {
  const defaultProps: Omit<DemoItemListItemProps, 'item' | 'queryRef'> = {
    id: 'item-1',
    refreshFavorites: jest.fn()
  };

  const TestComponent = (props: Partial<DemoItemListItemProps>) => {
    const [queryRef] = useFavoriteDemoItemsLoader();
    const data = useLazyLoadQuery<demoItemListItemTestQuery>(
      graphql`
        query demoItemListItemTestQuery @relay_test_operation {
          testItem: demoItem(id: "contentful-item-1") {
            ...demoItemListItem_item
          }
        }
      `,
      {}
    );

    if (!queryRef) {
      return null;
    }

    return (
      <Suspense fallback={null}>
        <DemoItemListItem {...defaultProps} {...props} queryRef={queryRef} item={data.testItem} />
      </Suspense>
    );
  };

  const getRelayEnv = (itemId: string | null) => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        DemoItem() {
          return demoItemFactory({
            sys: { id: 'item-1' },
            title: 'Example title',
            image: { title: 'first image title', url: 'https://image.url' },
          });
        },
      })
    );
    relayEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ContentfulDemoItemFavoriteType: () => ({ item: { pk: 'item-1' } }),
      })
    );
    relayEnvironment.mock.queuePendingOperation(demoItemListItemTestQueryGraphql, {});
    relayEnvironment.mock.queuePendingOperation(favoriteDemoItemListQueryGraphql, {});
    generateRelayEnvironment(itemId, relayEnvironment);
    return relayEnvironment;
  };

  const renderWithFavorites = (context: ContextData, itemId: string | null = 'item-1') => {
    const render = makeContextRenderer((props: Partial<DemoItemListItemProps>) => <TestComponent {...props} />);
    const relayEnvironment = getRelayEnv(itemId);
    const rendered = render({}, {...context, relayEnvironment});

    return {
      ...rendered,
      relayEnvironment,
    };
  };

  it('should render link to single item page', async () => {
    const { pushSpy, history } = spiedHistory();
    renderWithFavorites({ router: { history } });
    expect(screen.getByText('Example title')).toBeInTheDocument();
    expect(screen.getByLabelText(/is favorite/i)).toBeChecked()
    await userEvent.click(screen.getByText('Example title'));
    expect(pushSpy).toHaveBeenCalledWith({ hash: '', pathname: '/en/demo-items/item-1', search: ''}, undefined);
  });

  describe('item is marked as favorite', () => {
    it('should display checked checkbox', () => {
      renderWithFavorites({});
      expect(screen.getByLabelText(/is favorite/i)).toBeChecked();
    });

    // describe('item checkbox is clicked', () => {
    //   it('should call delete mutation', async () => {
    //     const { relayEnvironment } = renderWithFavorites({});
    //     const checkbox = screen.getByLabelText(/is favorite/i)
    //     expect(checkbox).toBeChecked();
    //     await userEvent.click(checkbox);
    //
    //     await waitFor(() => {
    //       const mutationOperation = relayEnvironment.mock.getAllOperations().at(- 2);
    //       expect(mutationOperation && mutationOperation.fragment.node.name).toEqual('useFavoriteDemoItemListDeleteMutation');
    //       const operation = relayEnvironment.mock.getMostRecentOperation();
    //       expect(operation.fragment.node.name).toEqual('demoItemListItemTestQuery');
    //       act(() => {
    //         mutationOperation && relayEnvironment.mock.resolve(mutationOperation, MockPayloadGenerator.generate(mutationOperation));
    //         relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    //       });
    //     });
    //
    //   });
    // });
  });

  describe('item is not marked as favorite', () => {
    it('should display unchecked checkbox', async () => {
      renderWithFavorites({}, null);
      expect(screen.getByLabelText(/is favorite/i)).not.toBeChecked();
    });

    // describe('item checkbox is clicked', () => {
    //   it('should call create mutation', async () => {
    //     const {relayEnvironment} = renderWithFavorites({}, null);
    //     await userEvent.click(screen.getByLabelText(/is favorite/i));
    //     console.log(relayEnvironment.mock.getAllOperations().map(op => op.fragment.node.name));
    //
    //     const mutationOperation = relayEnvironment.mock.getAllOperations().at(-2);
    //     expect(mutationOperation && mutationOperation.fragment.node.name).toEqual('useFavoriteDemoItemListCreateMutation');
    //     const operation = relayEnvironment.mock.getMostRecentOperation();
    //     expect(operation.fragment.node.name).toEqual('useFavoriteDemoItemListQuery');
    //
    //     act(() => {
    //       mutationOperation && relayEnvironment.mock.resolve(mutationOperation, MockPayloadGenerator.generate(mutationOperation));
    //       relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    //     });
    //   });
    // });
  });
});
