import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { CrudDemoItemListItem, CrudDemoItemListItemProps } from '../crudDemoItemListItem.component';
import { makeContextRenderer, spiedHistory } from '../../../../../shared/utils/testUtils';
import { crudDemoItemFactory } from '../../../../../mocks/factories';
import { crudDemoItemActions } from '../../../../../modules/crudDemoItem';

const item = crudDemoItemFactory({ id: 'test-id', name: 'test-name' });

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('CrudDemoItemListItem: Component', () => {
  const defaultProps: CrudDemoItemListItemProps = {
    item,
  };

  const component = (props: Partial<CrudDemoItemListItemProps>) => (
    <CrudDemoItemListItem {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should render link to details page', () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history } });
    userEvent.click(screen.getByText('test-name'));
    expect(pushSpy).toHaveBeenCalledWith('/en/crud-demo-item/test-id');
  });

  it('should render link to edit form', () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history } });
    userEvent.click(screen.getByText(/edit/gi));
    expect(pushSpy).toHaveBeenCalledWith('/en/crud-demo-item/edit/test-id');
  });

  it('should delete item when delete button is clicked', () => {
    render();
    userEvent.click(screen.getByText(/delete/gi));
    expect(mockDispatch).toHaveBeenCalledWith(crudDemoItemActions.deleteCrudDemoItem('test-id'));
  });
});
