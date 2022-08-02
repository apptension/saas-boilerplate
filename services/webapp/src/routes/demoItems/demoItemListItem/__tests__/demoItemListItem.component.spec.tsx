import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { prepareState } from '../../../../mocks/store';
import { demoItemsActions } from '../../../../modules/demoItems';
import { DemoItemListItem, DemoItemListItemProps } from '../demoItemListItem.component';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('DemoItemListItem: Component', () => {
  const defaultProps: DemoItemListItemProps = {
    id: 'item-1',
    item: {
      title: 'Example title',
      image: {
        title: 'image title',
        url: 'http://image.url',
      },
    },
  };

  const component = (props: Partial<DemoItemListItemProps>) => <DemoItemListItem {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should render link to single item page', async () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history } });
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
      render({}, { store });
      expect(screen.getByLabelText(/is favorite/i)).toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call setFavorite action with proper arguments', async () => {
        render({}, { store });
        await userEvent.click(screen.getByLabelText(/is favorite/i));
        expect(mockDispatch).toHaveBeenCalledWith(demoItemsActions.setFavorite({ id: 'item-1', isFavorite: false }));
      });
    });
  });

  describe('item is not marked as favorite', () => {
    it('should display unchecked checkbox', () => {
      render();
      expect(screen.getByLabelText(/is favorite/i)).not.toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call setFavorite action with proper arguments', async () => {
        render();
        await userEvent.click(screen.getByLabelText(/is favorite/i));
        expect(mockDispatch).toHaveBeenCalledWith(demoItemsActions.setFavorite({ id: 'item-1', isFavorite: true }));
      });
    });
  });
});
