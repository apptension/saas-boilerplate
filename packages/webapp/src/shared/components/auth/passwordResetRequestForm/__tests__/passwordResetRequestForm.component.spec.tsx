import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { append } from 'ramda';

import { render } from '../../../../../tests/utils/rendering';
import { PasswordResetRequestForm } from '../passwordResetRequestForm.component';
import { authRequestPasswordResetMutation } from '../passwordResetRequestForm.graphql';

jest.mock('@sb/webapp-core/services/analytics');

describe('PasswordResetRequestForm: Component', () => {
  const Component = () => <PasswordResetRequestForm />;

  const email = 'user@mail.com';

  const defaultVariable = {
    input: { email: 'user@mail.com' },
  };

  const fillForm = async (emailValue = email) => {
    await userEvent.type(await screen.findByLabelText(/email/i), emailValue);
  };

  const sendForm = async () => {
    await userEvent.click(await screen.findByRole('button', { name: /send the link/i }));
  };

  it('should show resend button if action completes successfully', async () => {
    const requestMock = composeMockedQueryResult(authRequestPasswordResetMutation, {
      variables: defaultVariable,
      data: {
        passwordReset: {
          ok: true,
        },
      },
    });

    render(<Component />, { apolloMocks: append(requestMock) });

    await fillForm();
    await sendForm();

    await waitFor(() => {
      expect(screen.getByText(/send the link again/i)).toBeInTheDocument();
    });

    expect(trackEvent).toHaveBeenCalledWith('auth', 'reset-password');
  });

  it('should show error if required value is missing', async () => {
    render(<Component />);

    await sendForm();

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should show generic form error if action throws error', async () => {
    const errorMessage = 'Email is invalid';
    const requestMock = composeMockedQueryResult(authRequestPasswordResetMutation, {
      variables: defaultVariable,
      data: {
        passwordReset: {
          ok: true,
        },
      },
      errors: [new GraphQLError(errorMessage)],
    });

    render(<Component />, { apolloMocks: append(requestMock) });

    await fillForm();
    await sendForm();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
