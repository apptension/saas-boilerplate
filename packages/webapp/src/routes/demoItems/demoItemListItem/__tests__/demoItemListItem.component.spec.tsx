import { Suspense } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { MockPayloadGenerator } from 'relay-test-utils';
import { Route, Routes, useParams } from 'react-router';
import { ConnectionHandler } from 'relay-runtime';

import { demoItemFactory } from '../../../../mocks/factories';
import { DemoItemListItem, DemoItemListItemProps } from '../demoItemListItem.component';
import { useFavoriteDemoItemsLoader } from '../../../../shared/hooks/useFavoriteDemoItem/useFavoriteDemoItem.hook';
import { render } from '../../../../tests/utils/rendering';
import { RoutesConfig } from '../../../../app/config/routes';
import { getRelayEnv as getBaseRelayEnv } from '../../../../tests/utils/relay';
import useFavoriteDemoItemListQueryGraphql from '../../../../shared/hooks/useFavoriteDemoItem/__generated__/useFavoriteDemoItemListQuery.graphql';
import demoItemListItemTestQueryGraphql, {
  demoItemListItemTestQuery,
} from './__generated__/demoItemListItemTestQuery.graphql';

describe('DemoItemListItem: Component', () => {
  const defaultProps: Omit<DemoItemListItemProps, 'item' | 'queryRef'> = {
    id: 'item-1',
    refreshFavorites: jest.fn(),
  };

  const DemoItemMockRoute = () => {
    const params = useParams<{ id: string }>();
    return <span>Demo item mock route {params.id}</span>;
  };

  const Component = (props: Partial<DemoItemListItemProps>) => {
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
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={null}>
              <DemoItemListItem {...defaultProps} {...props} queryRef={queryRef} item={data.testItem} />
            </Suspense>
          }
        />
        <Route path={RoutesConfig.getLocalePath(['demoItem'])} element={<DemoItemMockRoute />} />
      </Routes>
    );
  };

  describe('item is marked as favorite', () => {
    const getRelayEnv = () => {
      const relayEnvironment = getBaseRelayEnv();
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
          ContentfulDemoItemFavoriteType: () => ({ id: 'fav-item-1', item: { pk: 'item-1' } }),
        })
      );

      relayEnvironment.mock.queuePendingOperation(demoItemListItemTestQueryGraphql, {});
      relayEnvironment.mock.queuePendingOperation(useFavoriteDemoItemListQueryGraphql, {});

      return relayEnvironment;
    };

    it('should render link to single item page', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      expect(screen.getByText('Example title')).toBeInTheDocument();
      expect(screen.getByLabelText(/is favorite/i)).toBeChecked();
      await userEvent.click(screen.getByText('Example title'));

      expect(screen.getByText('Demo item mock route item-1')).toBeInTheDocument();
    });

    it('should display checked checkbox', () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      expect(screen.getByLabelText(/is favorite/i)).toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call delete mutation', async () => {
        const relayEnvironment = getRelayEnv();
        render(<Component />, { relayEnvironment });

        const checkbox = screen.getByLabelText(/is favorite/i);
        expect(checkbox).toBeChecked();
        await userEvent.click(checkbox);

        const mutationOperation = relayEnvironment.mock.getMostRecentOperation();
        expect(mutationOperation?.request.variables).toEqual({
          input: { item: 'item-1' },
          connections: [
            ConnectionHandler.getConnectionID('root', 'useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites'),
          ],
        });

        await act(async () => {
          relayEnvironment.mock.resolve(
            mutationOperation,
            MockPayloadGenerator.generate(mutationOperation, {
              DeleteFavoriteContentfulDemoItemMutationPayload() {
                return { deletedIds: ['fav-item-1'] };
              },
            })
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText(/is favorite/i)).not.toBeChecked();
        });
      });
    });
  });

  describe('item is not marked as favorite', () => {
    const getRelayEnv = () => {
      const relayEnvironment = getBaseRelayEnv();
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
          ContentfulDemoItemFavoriteType: () => ({ id: 'fav-other-item', item: { pk: 'other-item' } }),
        })
      );

      relayEnvironment.mock.queuePendingOperation(demoItemListItemTestQueryGraphql, {});
      relayEnvironment.mock.queuePendingOperation(useFavoriteDemoItemListQueryGraphql, {});

      return relayEnvironment;
    };

    it('should display unchecked checkbox', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      expect(screen.getByLabelText(/is favorite/i)).not.toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call delete mutation', async () => {
        const relayEnvironment = getRelayEnv();
        render(<Component />, { relayEnvironment });

        const checkbox = screen.getByLabelText(/is favorite/i);
        expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);

        const mutationOperation = relayEnvironment.mock.getMostRecentOperation();
        expect(mutationOperation?.request.variables).toEqual({
          input: { item: 'item-1' },
          connections: [
            ConnectionHandler.getConnectionID('root', 'useFavoriteDemoItemListQuery__allContentfulDemoItemFavorites'),
          ],
        });

        await act(async () => {
          relayEnvironment.mock.resolve(
            mutationOperation,
            MockPayloadGenerator.generate(mutationOperation, {
              ContentfulDemoItemFavoriteType() {
                return {
                  id: 'fav-item-1',
                  item: {
                    pk: 'item-1',
                  },
                };
              },
            })
          );
        });

        await waitFor(() => {
          expect(screen.getByLabelText(/is favorite/i)).toBeChecked();
        });
      });
    });
  });
});
