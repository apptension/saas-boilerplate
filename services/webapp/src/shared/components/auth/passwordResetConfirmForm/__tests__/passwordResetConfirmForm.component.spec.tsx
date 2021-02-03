import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { PasswordResetConfirmForm, PasswordResetConfirmFormProps } from '../passwordResetConfirmForm.component';
import { confirmPasswordReset } from '../../../../../modules/auth/auth.actions';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('PasswordResetConfirmForm: Component', () => {
  const defaultProps: PasswordResetConfirmFormProps = {
    user: 'user-id',
    token: 'token-value',
  };

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const formData = {
    newPassword: 'new-password',
    confirmPassword: 'new-password',
  };

  const component = (props: Partial<PasswordResetConfirmFormProps>) => (
    <PasswordResetConfirmForm {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should call changePassword action when submitted', async () => {
    mockDispatch.mockResolvedValue({ isError: false });

    render();
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm password/gi), formData.confirmPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        confirmPasswordReset({
          newPassword: formData.newPassword,
          token: defaultProps.token,
          user: defaultProps.user,
        })
      );
    });
  });

  it('should show success message if action completes successfully', async () => {
    mockDispatch.mockResolvedValue({ isError: false });

    render();
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm password/gi), formData.confirmPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    await waitFor(() => {
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    });
  });

  it('should show error if required value is missing', async () => {
    render();
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.click(screen.getByRole('button', { name: /change password/gi }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Confirm password is required')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, newPassword: ['Provided password is invalid'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm password/gi), formData.confirmPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided password is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: ['Invalid data'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    userEvent.type(screen.getByPlaceholderText(/confirm password/gi), formData.confirmPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
