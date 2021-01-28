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
    newPassword: ' new-pass',
  };

  it('should call login action when submitted', async () => {
    mockDispatch.mockResolvedValue({ error: false });

    render();
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(changePassword(formData));
    });
  });

  it('should show error if required value is missing', async () => {
    render();
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.click(screen.getByRole('button', { name: /change password/gi }));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('New password is required')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, newPassword: ['Provided password is invalid'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/old password/gi), formData.oldPassword);
    userEvent.type(screen.getByPlaceholderText(/new password/gi), formData.newPassword);
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
    act(() => userEvent.click(screen.getByRole('button', { name: /change password/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
