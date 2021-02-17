import React from 'react';

import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { act, waitFor } from '@testing-library/react';
import { AddCrudDemoItem } from '../addCrudDemoItem.component';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { crudDemoItemActions } from '../../../../modules/crudDemoItem';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('AddCrudDemoItem: Component', () => {
  const component = () => <AddCrudDemoItem />;
  const render = makeContextRenderer(component);

  const formData = {
    name: 'new item',
  };

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should display empty form', () => {
    render();
    expect(screen.getByPlaceholderText(/name/gi).getAttribute('value')).toBeNull();
  });

  it('should call addCrudDemoItem action when submitted', async () => {
    mockDispatch.mockResolvedValue({ id: 'test-id', ...formData, isError: false });
    render();
    userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
    act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(crudDemoItemActions.addCrudDemoItem(formData));
    });
  });

  describe('action completes successfully', () => {
    it('should show success message', async () => {
      mockDispatch.mockResolvedValue({ id: 'test-id', ...formData, isError: false });

      render();
      userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
      act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
      await waitFor(() => {
        expect(screen.getByText('Saved successfully')).toBeInTheDocument();
      });
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, name: ['Provided value is invalid'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
    act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
    await waitFor(() => {
      expect(screen.getByText('Provided value is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: ['Invalid data'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/name/gi), formData.name);
    act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
