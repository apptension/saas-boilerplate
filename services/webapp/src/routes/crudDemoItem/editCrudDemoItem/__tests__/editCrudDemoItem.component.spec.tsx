import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, waitFor, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { EditCrudDemoItem } from '../editCrudDemoItem.component';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { crudDemoItemActions } from '../../../../modules/crudDemoItem';
import { prepareState } from '../../../../mocks/store';
import { ROUTES } from '../../../app.constants';
import { snackbarActions } from '../../../../modules/snackbar';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const originalItem = {
  name: 'old item',
  id: 'test-id',
};

const store = prepareState((state) => {
  state.crudDemoItem.items = [originalItem];
});

describe('EditCrudDemoItem: Component', () => {
  const component = () => <EditCrudDemoItem />;
  const renderWithContext = makeContextRenderer(component);
  const render = () =>
    renderWithContext(
      {},
      {
        store,
        router: {
          url: `/en${generatePath(ROUTES.crudDemoItem.edit, { id: 'test-id' })}`,
          routePath: `/:lang${ROUTES.crudDemoItem.edit}`,
        },
      }
    );

  const formData = {
    name: 'new item',
  };

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should display empty form', () => {
    render();
    expect(screen.getByDisplayValue(/old item/gi)).toBeInTheDocument();
  });

  it('should call addCrudDemoItem action when submitted', async () => {
    mockDispatch.mockResolvedValue({ id: 'test-id', ...formData, isError: false });
    render();
    userEvent.clear(screen.getByPlaceholderText(/name/gi));
    userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
    act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        crudDemoItemActions.updateCrudDemoItem({ ...originalItem, ...formData })
      );
    });
  });

  describe('action completes successfully', () => {
    it('should show success message', async () => {
      mockDispatch.mockResolvedValue({ id: 'test-id', ...formData, isError: false });

      render();
      userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
      act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('🎉 Changes saved successfully!'));
      });
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({
      isError: true,
      name: [{ message: 'Provided value is invalid', code: 'invalid' }],
    });

    render();
    userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
    act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
    await waitFor(() => {
      expect(screen.getByText('Provided value is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({
      isError: true,
      nonFieldErrors: [{ message: 'Invalid data', code: 'invalid' }],
    });

    render();
    userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
    act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
