import React from 'react';

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { DemoItemListItem, DemoItemListItemProps } from '../demoItemListItem.component';
import { prepareState } from '../../../../mocks/store';
import { demoItemsActions } from '../../../../modules/demoItems';

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
    title: 'Example title',
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
      expect(screen.getByLabelText(/is favorite/gi)).toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call setFavorite action with proper arguments', () => {
        render({}, { store });
        userEvent.click(screen.getByLabelText(/is favorite/gi));
        expect(mockDispatch).toHaveBeenCalledWith(demoItemsActions.setFavorite({ id: 'item-1', isFavorite: false }));
      });
    });
  });

  describe('item is not marked as favorite', () => {
    it('should display unchecked checkbox', () => {
      render();
      expect(screen.getByLabelText(/is favorite/gi)).not.toBeChecked();
    });

    describe('item checkbox is clicked', () => {
      it('should call setFavorite action with proper arguments', () => {
        render();
        userEvent.click(screen.getByLabelText(/is favorite/gi));
        expect(mockDispatch).toHaveBeenCalledWith(demoItemsActions.setFavorite({ id: 'item-1', isFavorite: true }));
      });
    });
  });
});
