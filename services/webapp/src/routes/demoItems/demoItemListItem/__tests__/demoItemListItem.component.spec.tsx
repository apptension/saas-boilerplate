import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import demoItemListItemTestQueryGraphql, {
  demoItemListItemTestQuery,
} from '../../../../__generated__/demoItemListItemTestQuery.graphql';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { prepareState } from '../../../../mocks/store';
import { demoItemsActions } from '../../../../modules/demoItems';
import { demoItemFactory } from '../../../../mocks/factories';
import { DemoItemListItem, DemoItemListItemProps } from '../demoItemListItem.component';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('DemoItemListItem: Component', () => {
  const defaultProps: Omit<DemoItemListItemProps, 'item'> = {
    id: 'item-1',
  };

  const TestComponent = (props: Partial<DemoItemListItemProps>) => {
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

    return <DemoItemListItem {...defaultProps} {...props} item={data.testItem} />;
  };

  const getRelayEnv = () => {
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
    relayEnvironment.mock.queuePendingOperation(demoItemListItemTestQueryGraphql, {});
    return relayEnvironment;
  };

  const render = makeContextRenderer((props: Partial<DemoItemListItemProps>) => <TestComponent {...props} />);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should render link to single item page', async () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history }, relayEnvironment: getRelayEnv() });
    await waitFor(() => {
      expect(screen.getByText('Example title')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Example title'));
    expect(pushSpy).toHaveBeenCalledWith('/en/demo-items/item-1');
  });

  describe('item is marked as favorite', () => {
    const store = prepareState((state) => {
      state.demoItems.favorites = ['item-1'];
    });

    it('should display checked checkbox', () => {
      render({}, { store, relayEnvironment: getRelayEnv() });
      expect(screen.getByLabelText(/is favorite/i)).toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call setFavorite action with proper arguments', async () => {
        render({}, { store, relayEnvironment: getRelayEnv() });
        await userEvent.click(screen.getByLabelText(/is favorite/i));
        expect(mockDispatch).toHaveBeenCalledWith(demoItemsActions.setFavorite({ id: 'item-1', isFavorite: false }));
      });
    });
  });

  describe('item is not marked as favorite', () => {
    it('should display unchecked checkbox', () => {
      render({}, { relayEnvironment: getRelayEnv() });
      expect(screen.getByLabelText(/is favorite/i)).not.toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call setFavorite action with proper arguments', async () => {
        render({}, { relayEnvironment: getRelayEnv() });
        await userEvent.click(screen.getByLabelText(/is favorite/i));
        expect(mockDispatch).toHaveBeenCalledWith(demoItemsActions.setFavorite({ id: 'item-1', isFavorite: true }));
      });
    });
  });
});
