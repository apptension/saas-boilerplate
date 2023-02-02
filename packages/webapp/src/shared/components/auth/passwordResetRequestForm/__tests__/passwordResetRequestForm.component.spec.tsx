import { append } from 'ramda';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { render } from '../../../../../tests/utils/rendering';
import { PasswordResetRequestForm } from '../passwordResetRequestForm.component';

import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';
import { authRequestPasswordResetMutation } from '../passwordResetRequestForm.graphql';

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
