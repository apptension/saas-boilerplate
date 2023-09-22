import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error';

import { render } from '../../../../../tests/utils/rendering';
import { ChangePasswordForm } from '../changePasswordForm.component';
import { authChangePasswordMutation } from '../changePasswordForm.graphql';

jest.mock('@sb/webapp-core/services/analytics');

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

  const fillForm = async (override = {}) => {
    const data = { ...formData, ...override };
    await userEvent.type(screen.getByLabelText(/old password/i), data.oldPassword);
    data.newPassword && (await userEvent.type(screen.getByLabelText(/^new password/i), data.newPassword));
    await userEvent.type(screen.getByLabelText(/confirm new password/i), data.confirmNewPassword);
  };

  const submitForm = () => userEvent.click(screen.getByRole('button', { name: /change password/i }));

  it('should show message on success action call', async () => {
    const requestMock = composeMockedQueryResult(authChangePasswordMutation, {
      variables: defaultValues,
      data: defaultResult,
    });

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock),
    });

    await waitForApolloMocks(0);

    await fillForm();
    await submitForm();
    await waitForApolloMocks();

    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('Password successfully changed.');
    expect(trackEvent).toHaveBeenCalledWith('profile', 'password-update');
  });

  it('should clear form', async () => {
    const requestMock = composeMockedQueryResult(authChangePasswordMutation, {
      variables: defaultValues,
      data: defaultResult,
    });
    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock),
    });

    await waitForApolloMocks(0);

    await fillForm();
    await submitForm();

    await waitForApolloMocks();

    expect(screen.queryByDisplayValue(formData.oldPassword)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(formData.newPassword)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(formData.confirmNewPassword)).not.toBeInTheDocument();
  });

  it('should show error if required value is missing', async () => {
    const { waitForApolloMocks } = render(<Component />);

    await waitForApolloMocks();

    await fillForm({ newPassword: null });
    await submitForm();

    const toaster = await screen.findByTestId('toaster');
    expect(toaster).toBeEmptyDOMElement();

    expect(screen.getByText('New password is required')).toBeInTheDocument();
  });

  it('should show error if new passwords dont match', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();

    await fillForm({ confirmNewPassword: 'misspelled-pass' });
    await submitForm();

    const toaster = await screen.findByTestId('toaster');
    expect(toaster).toBeEmptyDOMElement();

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

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock),
    });

    await waitForApolloMocks(0);

    await fillForm();
    await submitForm();

    const toaster = await screen.findByTestId('toaster');
    expect(toaster).toBeEmptyDOMElement();

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

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock),
    });

    await waitForApolloMocks(0);

    await fillForm();
    await submitForm();

    const toaster = await screen.findByTestId('toaster');
    expect(toaster).toBeEmptyDOMElement();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
