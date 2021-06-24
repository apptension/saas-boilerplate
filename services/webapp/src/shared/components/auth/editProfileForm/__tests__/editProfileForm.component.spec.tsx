import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { EditProfileForm } from '../editProfileForm.component';
import { userProfileFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { updateProfile } from '../../../../../modules/auth/auth.actions';
import { snackbarActions } from '../../../../../modules/snackbar';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('EditProfileForm: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const component = () => <EditProfileForm />;
  const originalProfile = userProfileFactory({
    firstName: 'Jack',
    lastName: 'White',
    email: 'jack.white@mail.com',
    roles: [Role.ADMIN, Role.USER],
  });

  const render = makeContextRenderer(component);

  const formData = {
    firstName: 'updated-first-name',
    lastName: 'updated-last-name',
  };

  const updatedProfile = {
    ...originalProfile,
    ...formData,
  };

  it('should call updateProfile action when submitted', async () => {
    mockDispatch.mockResolvedValue({ ...updatedProfile, isError: false });

    render();
    userEvent.type(screen.getByLabelText(/first name/gi), formData.firstName);
    userEvent.type(screen.getByLabelText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update personal data/gi })));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(updateProfile(formData));
    });
  });

  describe('action completes successfully', () => {
    it('should show success message', async () => {
      mockDispatch.mockResolvedValue({ ...updatedProfile, isError: false });

      render();
      userEvent.type(screen.getByLabelText(/first name/gi), formData.firstName);
      userEvent.type(screen.getByLabelText(/last name/gi), formData.lastName);
      act(() => userEvent.click(screen.getByRole('button', { name: /update personal data/gi })));
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('Personal data successfully changed.'));
      });
    });

    it('should display updated values', async () => {
      mockDispatch.mockResolvedValue({ ...updatedProfile, isError: false });

      render();
      userEvent.type(screen.getByLabelText(/first name/gi), formData.firstName);
      userEvent.type(screen.getByLabelText(/last name/gi), formData.lastName);
      act(() => userEvent.click(screen.getByRole('button', { name: /update personal data/gi })));
      await waitFor(() => {
        expect(screen.getByDisplayValue(formData.firstName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(formData.lastName)).toBeInTheDocument();
      });
    });
  });

  it('should show error if value is too long', async () => {
    render();
    userEvent.type(screen.getByLabelText(/first name/gi), '_'.repeat(41));
    userEvent.type(screen.getByLabelText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update personal data/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('First name is too long')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({
      isError: true,
      firstName: [{ message: 'Provided value is invalid', code: 'invalid' }],
    });

    render();
    userEvent.type(screen.getByLabelText(/first name/gi), formData.firstName);
    userEvent.type(screen.getByLabelText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update personal data/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided value is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: [{ message: 'Invalid data', code: 'invalid' }] });

    render();
    userEvent.type(screen.getByLabelText(/first name/gi), formData.firstName);
    userEvent.type(screen.getByLabelText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update personal data/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
