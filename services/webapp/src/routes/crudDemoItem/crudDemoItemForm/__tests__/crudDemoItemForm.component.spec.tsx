import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { snackbarActions } from '../../../../modules/snackbar';
import { CrudDemoItemForm, CrudDemoItemFormProps } from '../crudDemoItemForm.component';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('CrudDemoItemForm: Component', () => {
  const defaultProps: CrudDemoItemFormProps = {
    initialData: {
      name: 'initial name',
    },
    onSubmit: jest.fn(),
  };

  const component = (props: Partial<CrudDemoItemFormProps>) => <CrudDemoItemForm {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should display empty form', () => {
    render();
    expect(screen.getByPlaceholderText(/name/gi).getAttribute('value')).toBeNull();
  });

  describe('action completes successfully', () => {
    it('should call onSubmit prop', async () => {
      const onSubmit = jest.fn().mockReturnValue({
        errors: null,
      });
      render({ onSubmit });

      const nameField = screen.getByPlaceholderText(/name/gi);
      userEvent.clear(nameField);
      userEvent.type(nameField, 'new item name');
      act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ name: 'new item name' });
      });
    });

    it('should show success message', async () => {
      const onSubmit = jest.fn().mockReturnValue({
        errors: null,
      });
      render({ onSubmit });
      userEvent.type(screen.getByPlaceholderText(/name/gi), 'new item name');
      act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('🎉 Changes saved successfully!'));
      });
    });
  });

  // it('should show field error if action throws error', async () => {
  //   mockDispatch.mockResolvedValue({
  //     isError: true,
  //     name: [{ message: 'Provided value is invalid', code: 'invalid' }],
  //   });
  //
  //   render();
  //   userEvent.type(screen.getByPlaceholderText(/name/gi), 'new item name');
  //   act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
  //   await waitFor(() => {
  //     expect(screen.getByText('Provided value is invalid')).toBeInTheDocument();
  //   });
  // });
  //
  // it('should show generic form error if action throws error', async () => {
  //   mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: [{ message: 'Invalid data', code: 'invalid' }] });
  //
  //   render();
  //   userEvent.type(screen.getByPlaceholderText(/name/gi), 'new item name');
  //   act(() => userEvent.click(screen.getByRole('button', { name: /save/gi })));
  //   await waitFor(() => {
  //     expect(screen.getByText('Invalid data')).toBeInTheDocument();
  //   });
  // });
});
