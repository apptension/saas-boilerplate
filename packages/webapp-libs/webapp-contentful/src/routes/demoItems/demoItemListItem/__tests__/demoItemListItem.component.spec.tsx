import { composeMockedListQueryResult } from '@sb/webapp-api-client/tests/utils';
import { getLocalePath } from '@sb/webapp-core/utils/path';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { append } from 'ramda';
import { Route, Routes, useParams } from 'react-router';

import { RoutesConfig } from '../../../../config/routes';
import { useFavoriteDemoItemListQuery } from '../../../../hooks/useFavoriteDemoItem/useFavoriteDemoItem.graphql';
import {
  demoItemFactory,
  fillCreateFavouriteDemoItemQuery,
  fillRemoveFavouriteDemoItemQuery,
} from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { DemoItemListItem, DemoItemListItemProps } from '../demoItemListItem.component';

const allItems = [...Array(3)].map((_, i) => ({
  id: `item-${i + 1}`,
  item: {
    pk: `item-${i + 1}`,
    __typename: 'ContentfulDemoItemType',
  },
  __typename: 'ContentfulDemoItemFavoriteType',
}));

const mockItemsResponse = () => {
  return composeMockedListQueryResult(
    useFavoriteDemoItemListQuery,
    'allContentfulDemoItemFavorites',
    'UseFavoriteDemoItemListQueryQuery',
    {
      data: allItems,
    }
  );
};

const demoItem = {
  ...demoItemFactory({
    sys: { id: 'item-1' },
    title: 'Example title',
    image: { title: 'first image title', url: 'https://image.url' },
  }),
};

describe('DemoItemListItem: Component', () => {
  const defaultProps: Omit<DemoItemListItemProps, 'item'> = {
    id: 'item-1',
  };

  const DemoItemMockRoute = () => {
    const params = useParams<{ id: string }>();
    return <span>Demo item mock route {params.id}</span>;
  };

  const Component = (props: Partial<DemoItemListItemProps>) => {
    return (
      <Routes>
        <Route path="/" element={<DemoItemListItem {...defaultProps} {...props} item={demoItem} />} />
        <Route path={getLocalePath(RoutesConfig.demoItem)} element={<DemoItemMockRoute />} />
      </Routes>
    );
  };

  describe('item is marked as favorite', () => {
    it('should render link to single item page', async () => {
      const itemsMock = mockItemsResponse();
      const { waitForApolloMocks } = render(<Component id="item-1" />, {
        apolloMocks: append(itemsMock),
      });
      await waitForApolloMocks(1);
      expect(await screen.findByText('Example title')).toBeInTheDocument();
      expect(await screen.findByLabelText(/is favorite/i)).toBeChecked();
      await userEvent.click(screen.getByText('Example title'));

      expect(screen.getByText('Demo item mock route item-1')).toBeInTheDocument();
    });

    it('should display checked checkbox', async () => {
      const itemsMock = mockItemsResponse();
      const { waitForApolloMocks } = render(<Component id="item-1" />, {
        apolloMocks: append(itemsMock),
      });
      await waitForApolloMocks();

      expect(await screen.findByLabelText(/is favorite/i)).toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call delete mutation', async () => {
        const itemsMock = mockItemsResponse();
        const id = 'item-1';
        const mutationData = {
          deleteFavoriteContentfulDemoItem: {
            deletedIds: [],
          },
        };
        const removeFavoriteItemMockResponse = fillRemoveFavouriteDemoItemQuery(id, mutationData);
        removeFavoriteItemMockResponse.newData = jest.fn(() => ({
          data: mutationData,
        }));

        const { waitForApolloMocks } = render(<Component id={id} />, {
          apolloMocks: (defaultMocks) => defaultMocks.concat(itemsMock, removeFavoriteItemMockResponse),
        });
        await waitForApolloMocks(1);

        const checkbox = await screen.findByLabelText(/is favorite/i);
        expect(checkbox).toBeChecked();

        await userEvent.click(checkbox);
        expect(removeFavoriteItemMockResponse.newData).toHaveBeenCalled();
      });
    });
  });

  describe('item is not marked as favorite', () => {
    it('should display unchecked checkbox', async () => {
      const itemsMock = mockItemsResponse();
      const { waitForApolloMocks } = render(<Component id="item-999" />, { apolloMocks: append(itemsMock) });
      await waitForApolloMocks(1);
      expect(await screen.findByLabelText(/is favorite/i)).not.toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      const id = 'item-999';
      const mutationData = {
        createFavoriteContentfulDemoItem: {
          contentfulDemoItemFavoriteEdge: {
            node: {
              id,
              item: {
                pk: id,
              },
            },
          },
        },
      };
      const createFavoriteItemMockResponse = fillCreateFavouriteDemoItemQuery(id, mutationData);
      createFavoriteItemMockResponse.newData = jest.fn(() => ({
        data: mutationData,
      }));

      it('should call create mutation', async () => {
        const itemsMock = mockItemsResponse();
        const { waitForApolloMocks } = render(<Component id={id} />, {
          apolloMocks: (defaultMocks) => defaultMocks.concat(itemsMock, createFavoriteItemMockResponse),
        });
        await waitForApolloMocks(1);
        const checkbox = await screen.findByLabelText(/is favorite/i);
        expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);

        expect(createFavoriteItemMockResponse.newData).toHaveBeenCalled();
      });
    });
  });
});
