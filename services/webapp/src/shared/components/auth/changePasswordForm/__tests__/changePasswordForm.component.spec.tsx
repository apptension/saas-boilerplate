import React from 'react';

import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { ChangePasswordForm } from '../changePasswordForm.component';
import { changePassword } from '../../../../../modules/auth/auth.actions';

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
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm new password/gi), formData.confirmNewPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
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
      userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
      userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
      userEvent.type(screen.getByPlaceholderText(/confirm new password/gi), formData.confirmNewPassword);
      act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
      await waitFor(() => {
        expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
      });
    });

    it('should clear form', async () => {
      mockDispatch.mockResolvedValue({ isError: false });

      render();
      userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
      userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
      userEvent.type(screen.getByPlaceholderText(/confirm new password/gi), formData.confirmNewPassword);
      act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
      await waitFor(() => {
        expect(screen.queryByDisplayValue(formData.oldPassword)).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(formData.newPassword)).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(formData.confirmNewPassword)).not.toBeInTheDocument();
      });
    });
  });

  it('should show error if required value is missing', async () => {
    render();
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm new password/gi), formData.confirmNewPassword);
    userEvent.click(screen.getByRole('button', { name: /change password/gi }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('New password is required')).toBeInTheDocument();
    });
  });

  it('should show error if new passwords dont match', async () => {
    render();
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm new password/gi), 'misspelled-pass');
    userEvent.click(screen.getByRole('button', { name: /change password/gi }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Passwords must match')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, newPassword: ['Provided password is invalid'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm new password/gi), formData.confirmNewPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided password is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: ['Invalid data'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm new password/gi), formData.confirmNewPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
