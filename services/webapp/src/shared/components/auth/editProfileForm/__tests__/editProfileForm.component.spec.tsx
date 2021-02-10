import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { EditProfileForm } from '../editProfileForm.component';
import { prepareState } from '../../../../../mocks/store';
import { userProfileFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { updateProfile } from '../../../../../modules/auth/auth.actions';

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
  const store = prepareState((state) => {
    state.auth.profile = originalProfile;
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

  it('should display profile data', () => {
    render({}, { store });
    expect(screen.getByDisplayValue('Jack')).toBeInTheDocument();
    expect(screen.getByDisplayValue('White')).toBeInTheDocument();
    expect(screen.getByText('jack.white@mail.com')).toBeInTheDocument();
    expect(screen.getByText('admin,user')).toBeInTheDocument();
  });

  it('should call updateProfile action when submitted', async () => {
    mockDispatch.mockResolvedValue({ ...updatedProfile, isError: false });

    render();
    userEvent.type(screen.getByPlaceholderText(/first name/gi), formData.firstName);
    userEvent.type(screen.getByPlaceholderText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update profile/gi })));
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(updateProfile(formData));
    });
  });

  describe('action completes successfully', () => {
    it('should show success message', async () => {
      mockDispatch.mockResolvedValue({ ...updatedProfile, isError: false });

      render();
      userEvent.type(screen.getByPlaceholderText(/first name/gi), formData.firstName);
      userEvent.type(screen.getByPlaceholderText(/last name/gi), formData.lastName);
      act(() => userEvent.click(screen.getByRole('button', { name: /update profile/gi })));
      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
      });
    });

    it('should display updated values', async () => {
      mockDispatch.mockResolvedValue({ ...updatedProfile, isError: false });

      render();
      userEvent.type(screen.getByPlaceholderText(/first name/gi), formData.firstName);
      userEvent.type(screen.getByPlaceholderText(/last name/gi), formData.lastName);
      act(() => userEvent.click(screen.getByRole('button', { name: /update profile/gi })));
      await waitFor(() => {
        expect(screen.getByDisplayValue(formData.firstName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(formData.lastName)).toBeInTheDocument();
      });
    });
  });

  it('should show error if value is too long', async () => {
    render();
    userEvent.type(screen.getByPlaceholderText(/first name/gi), '_'.repeat(41));
    userEvent.type(screen.getByPlaceholderText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update profile/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('First name is too long')).toBeInTheDocument();
    });
  });

  it('should show field error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, firstName: ['Provided value is invalid'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/first name/gi), formData.firstName);
    userEvent.type(screen.getByPlaceholderText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update profile/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Provided value is invalid')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    mockDispatch.mockResolvedValue({ isError: true, nonFieldErrors: ['Invalid data'] });

    render();
    userEvent.type(screen.getByPlaceholderText(/first name/gi), formData.firstName);
    userEvent.type(screen.getByPlaceholderText(/last name/gi), formData.lastName);
    act(() => userEvent.click(screen.getByRole('button', { name: /update profile/gi })));
    expect(mockDispatch).not.toHaveBeenCalledWith();
    await waitFor(() => {
      expect(screen.getByText('Invalid data')).toBeInTheDocument();
    });
  });
});
