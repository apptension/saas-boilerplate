import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error';
import { screen, waitFor } from '@testing-library/react';

import { authChangePasswordMutation } from '../changePasswordForm.graphql';
import { render } from '../../../../../tests/utils/rendering';
import { snackbarActions } from '../../../../../modules/snackbar';
import { ChangePasswordForm } from '../changePasswordForm.component';

import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});
const formData = {
  oldPassword: 'old-pass',
  newPassword: 'new-pass',
  confirmNewPassword: 'new-pass',
};
const defaultValues = {
  input: {
    oldPassword: formData.oldPassword,
    newPassword: formData.newPassword,
  },
};

const defaultResult = {
  changePassword: {
    access: '',
    refresh: '',
  },
};

describe('ChangePasswordForm: Component', () => {
  const Component = () => <ChangePasswordForm />;

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const fillForm = async (override = {}) => {
    const data = { ...formData, ...override };
    await userEvent.type(screen.getByLabelText(/old password/i), data.oldPassword);
    data.newPassword && (await userEvent.type(screen.getByLabelText(/^new password/i), data.newPassword));
    await userEvent.type(screen.getByLabelText(/confirm new password/i), data.confirmNewPassword);
  };

  const submitForm = () => userEvent.click(screen.getByRole('button', { name: /change password/i }));

  it('should show message on success action call', async () => {
    mockDispatch.mockResolvedValue({ isError: false });
    const requestMock = composeMockedQueryResult(authChangePasswordMutation, {
      variables: defaultValues,
      data: defaultResult,
    });
    render(<Component />, { apolloMocks: [requestMock] });

    await fillForm();
    await submitForm();
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'Password successfully changed.',
          id: 1,
        })
      );
    });
  });

  it('should clear form', async () => {
    const requestMock = composeMockedQueryResult(authChangePasswordMutation, {
      variables: defaultValues,
      data: defaultResult,
    });
    render(<Component />, { apolloMocks: [requestMock] });

    await fillForm();
    await submitForm();

    await waitFor(() => expect(screen.queryByDisplayValue(formData.oldPassword)).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByDisplayValue(formData.newPassword)).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByDisplayValue(formData.confirmNewPassword)).not.toBeInTheDocument());
  });

  it('should show error if required value is missing', async () => {
    render(<Component />);

    await fillForm({ newPassword: null });
    await submitForm();

    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText('New password is required')).toBeInTheDocument();
  });

  it('should show error if new passwords dont match', async () => {
    render(<Component />);

    await fillForm({ confirmNewPassword: 'misspelled-pass' });
    await submitForm();

    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(screen.getByText('Passwords must match')).toBeInTheDocument();
  });

  it('should show field error if action throws error', async () => {
    const errorMessage = 'The password is too common.';
    const errors = [
      new GraphQLError('GraphQlValidationError', {
        extensions: { newPassword: [{ message: errorMessage, code: 'password_too_common' }] },
      }),
    ];
    const requestMock = composeMockedQueryResult(authChangePasswordMutation, {
      variables: defaultValues,
      data: defaultResult,
      errors,
    });

    render(<Component />, { apolloMocks: [requestMock] });

    await fillForm();
    await submitForm();

    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('should show generic form error if action throws error', async () => {
    const errorMessage = 'Server error';
    const errors = [new GraphQLError(errorMessage)];
    const requestMock = composeMockedQueryResult(authChangePasswordMutation, {
      variables: defaultValues,
      data: defaultResult,
      errors,
    });

    render(<Component />, { apolloMocks: [requestMock] });

    await fillForm();
    await submitForm();

    expect(mockDispatch).not.toHaveBeenCalledWith();
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
