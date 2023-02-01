import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { render } from '../../../../../tests/utils/rendering';
import { EditProfileForm } from '../editProfileForm.component';

import { snackbarActions } from '../../../../../modules/snackbar';

import { authUpdateUserProfileMutation } from '../editProfileForm.graphql';
import { Role } from '../../../../../modules/auth/auth.types';

import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';
import { currentUserFactory } from '../../../../../mocks/factories';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const formData = {
  firstName: 'updated-first-name',
  lastName: 'updated-last-name',
};

const requestMock = (error?: GraphQLError[]) => ({
  request: {
    query: authUpdateUserProfileMutation,
    variables: {
      input: {
        firstName: formData.firstName,
        lastName: formData.lastName,
      },
    },
  },
  result: {
    data: {
      updateCurrentUser: {
        userProfile: {
          id: '1',
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        },
      },
    },
    errors: error,
  },
});

const renderComponent = (error?: GraphQLError[]) => {
  const currentUser = currentUserFactory({
    firstName: 'Jack',
    lastName: 'White',
    email: 'jack.white@mail.com',
    roles: [Role.ADMIN, Role.USER],
  });
  const apolloMocks = [fillCommonQueryWithUser(undefined, currentUser), requestMock(error)];
  return {
    ...render(<EditProfileForm />, { apolloMocks }),
    updatedUser: {
      ...currentUser,
      ...formData,
    },
  };
};

describe('EditProfileForm: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const getFirstNameField = () => screen.findByLabelText(/first name/i);
  const getLastNameField = () => screen.getByLabelText(/last name/i);

  const fillForm = async () => {
    await userEvent.clear(await getFirstNameField());
    await userEvent.clear(getLastNameField());
    await userEvent.type(await getFirstNameField(), formData.firstName);
    await userEvent.type(getLastNameField(), formData.lastName);
  };

  const submitForm = async () => {
    await userEvent.click(screen.getByRole('button', { name: /update personal data/i }));
  };

  it('should show success message after success action', async () => {
    renderComponent();

    await fillForm();
    await submitForm();

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'Personal data successfully changed.',
          id: 1,
        })
      );
    });
  });

  it('should display updated values', async () => {
    renderComponent();

    await fillForm();
    await submitForm();

    expect(screen.getByDisplayValue(formData.firstName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(formData.lastName)).toBeInTheDocument();
  });

  it('should show error if value is too long', async () => {
    renderComponent();
    await userEvent.type(await screen.findByLabelText(/first name/i), '_'.repeat(41));
    await userEvent.type(screen.getByLabelText(/last name/i), formData.lastName);

    await submitForm();

    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText('First name is too long')).toBeInTheDocument();
  });

  it('should show generic form error if action throws error', async () => {
    const errorMessage = 'Invalid data';
    const error = [new GraphQLError(errorMessage)];
    renderComponent(error);

    await fillForm();
    await submitForm();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
