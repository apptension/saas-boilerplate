import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import { render } from '../../../../../tests/utils/rendering';
import { EditProfileForm } from '../editProfileForm.component';
import { currentUserFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { snackbarActions } from '../../../../../modules/snackbar';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';

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

  const formData = {
    firstName: 'updated-first-name',
    lastName: 'updated-last-name',
  };

  const renderComponent = () => {
    const relayEnvironment = createMockEnvironment();
    const currentUser = currentUserFactory({
      firstName: 'Jack',
      lastName: 'White',
      email: 'jack.white@mail.com',
      roles: [Role.ADMIN, Role.USER],
    });
    fillCommonQueryWithUser(relayEnvironment, currentUser);
    return {
      ...render(<EditProfileForm />, { relayEnvironment }),
      relayEnvironment,
      updatedUser: {
        ...currentUser,
        ...formData,
      },
    };
  };

  const getFirstNameField = () => screen.getByLabelText(/first name/i);
  const getLastNameField = () => screen.getByLabelText(/last name/i);

  const fillForm = async () => {
    await userEvent.clear(getFirstNameField());
    await userEvent.clear(getLastNameField());
    await userEvent.type(getFirstNameField(), formData.firstName);
    await userEvent.type(getLastNameField(), formData.lastName);
  };

  const submitForm = async () => {
    await userEvent.click(screen.getByRole('button', { name: /update personal data/i }));
  };

  it('should call updateProfile action when submitted', async () => {
    const { relayEnvironment } = renderComponent();

    await fillForm();
    await submitForm();
    expect(relayEnvironment).toHaveLatestOperation('authUpdateUserProfileMutation');
    expect(relayEnvironment).toLatestOperationInputEqual(formData);
  });

  describe('action completes successfully', () => {
    it('should show success message', async () => {
      const { relayEnvironment } = renderComponent();

      await fillForm();
      await submitForm();

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'Personal data successfully changed.',
          id: 1,
        })
      );
    });

    it('should display updated values', async () => {
      const { relayEnvironment } = renderComponent();
      await fillForm();
      await submitForm();

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

      expect(screen.getByDisplayValue(formData.firstName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(formData.lastName)).toBeInTheDocument();
    });
  });

  it('should show error if value is too long', async () => {
    const { relayEnvironment } = renderComponent();
    await userEvent.type(screen.getByLabelText(/first name/i), '_'.repeat(41));
    await userEvent.type(screen.getByLabelText(/last name/i), formData.lastName);
    await submitForm();
    expect(relayEnvironment).not.toHaveLatestOperation('authUpdateUserProfileMutation');
    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText('First name is too long')).toBeInTheDocument();
  });

  it('should show field error if action throws error', async () => {
    const { relayEnvironment } = renderComponent();
    await fillForm();
    await submitForm();

    expect(relayEnvironment).toHaveLatestOperation('authUpdateUserProfileMutation');

    const errorMessage = 'Provided value is invalid';
    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, {
        ...MockPayloadGenerator.generate(operation),
        errors: [
          {
            message: 'GraphQlValidationError',
            extensions: {
              firstName: [
                {
                  message: errorMessage,
                  code: 'invalid',
                },
              ],
            },
          },
        ],
      } as any);
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show generic form error if action throws error', async () => {
    const { relayEnvironment } = renderComponent();
    await fillForm();
    await submitForm();

    expect(relayEnvironment).toHaveLatestOperation('authUpdateUserProfileMutation');
    const errorMessage = 'Invalid data';

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, {
        ...MockPayloadGenerator.generate(operation),
        errors: [
          {
            message: 'GraphQlValidationError',
            extensions: {
              nonFieldErrors: [
                {
                  message: errorMessage,
                  code: 'invalid',
                },
              ],
            },
          },
        ],
      } as any);
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
