import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { ChangePasswordForm } from '../changePasswordForm.component';
import { changePassword } from '../../../../../modules/auth/auth.actions';
import { snackbarActions } from '../../../../../modules/snackbar';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('ChangePasswordForm: Component', () => {
  const component = () => <ChangePasswordForm />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const formData = {
    oldPassword: 'old-pass',
    newPassword: 'new-pass',
    confirmNewPassword: 'new-pass',
  };

  it('should call changePassword action when submitted', async () => {
    mockDispatch.mockResolvedValue({ isError: false });

    render();
    await userEvent.type(screen.getByLabelText(/old password/i), formData.oldPassword);
    await userEvent.type(screen.getByLabelText(/^new password/i), formData.newPassword);
    await userEvent.type(screen.getByLabelText(/confirm new password/i), formData.confirmNewPassword);
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        changePassword({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        })
      );
    });
  });

  describe('action completes successfully', () => {
    it('should show success message', async () => {
      mockDispatch.mockResolvedValue({ isError: false });

      render();
      await userEvent.type(screen.getByLabelText(/old password/i), formData.oldPassword);
      await userEvent.type(screen.getByLabelText(/^new password/i), formData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirm new password/i), formData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /change password/i }));
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('Password successfully changed.'));
      });
    });

    it('should clear form', async () => {
      mockDispatch.mockResolvedValue({ isError: false });

      render();
      await userEvent.type(screen.getByLabelText(/old password/i), formData.oldPassword);
      await userEvent.type(screen.getByLabelText(/^new password/i), formData.newPassword);
      await userEvent.type(screen.getByLabelText(/confirm new password/i), formData.confirmNewPassword);
      await userEvent.click(screen.getByRole('button', { name: /change password/i }));
      await waitFor(() => {
        expect(screen.queryByDisplayValue(formData.oldPassword)).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(formData.newPassword)).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(formData.confirmNewPassword)).not.toBeInTheDocument();
      });
    });
  });

  it('should show error if required value is missing', async () => {
    render();
    await userEvent.type(screen.getByLabelText(/old password/i), formData.oldPassword);
    await userEvent.type(screen.getByLabelText(/confirm new password/i), formData.confirmNewPassword);
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('New password is required')).toBeInTheDocument();
    });
  });

  it('should show error if new passwords dont match', async () => {
    render();
    await userEvent.type(screen.getByLabelText(/old password/i), formData.oldPassword);
    await userEvent.type(screen.getByLabelText(/^new password/i), formData.newPassword);
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'misspelled-pass');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Passwords must match')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({
      isError: true,
      newPassword: [{ message: 'Provided password is invalid', code: 'invalid' }],
    });

    render();
    await userEvent.type(screen.getByLabelText(/old password/i), formData.oldPassword);
    await userEvent.type(screen.getByLabelText(/^new password/i), formData.newPassword);
    await userEvent.type(screen.getByLabelText(/confirm new password/i), formData.confirmNewPassword);
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided password is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: [{ message: 'Invalid data', code: 'invalid' }] });

    render();
    await userEvent.type(screen.getByLabelText(/old password/i), formData.oldPassword);
    await userEvent.type(screen.getByLabelText(/^new password/i), formData.newPassword);
    await userEvent.type(screen.getByLabelText(/confirm new password/i), formData.confirmNewPassword);
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
