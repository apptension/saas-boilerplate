import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql';

import { render } from '../../../../../tests/utils/rendering';
import { generateOtpMutation, verifyOtpMutation } from '../../twoFactorAuthForm/twoFactorAuthForm.graphql';
import { AddTwoFactorAuth } from '../addTwoFactorAuth.component';

jest.mock('@sb/webapp-core/services/analytics');

const closeModal = jest.fn();
const user = currentUserFactory();

const Component = () => <AddTwoFactorAuth closeModal={closeModal} />;

const getGenerateOtpMock = () =>
  composeMockedQueryResult(generateOtpMutation, {
    data: {
      generateOtp: {
        base32: 'bas32string',
        otpauthUrl: 'otpAuthUrl',
      },
    },
    variables: { input: {} },
  });

describe('AddTwoFactorAuth: Component', () => {
  beforeEach(() => {
    closeModal.mockReset();
  });

  it('should validate token and close modal', async () => {
    const token = '331553';
    const refreshQueryMock = fillCommonQueryWithUser(user);
    const generateOtpMock = getGenerateOtpMock();
    const verifyMock = composeMockedQueryResult(verifyOtpMutation, {
      variables: { input: { otpToken: token } },
      data: { verifyOtp: { otpVerified: true } },
    });

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (apolloMocks) => {
        // generateOtpMock must be first since it's called on mount
        return [...apolloMocks, generateOtpMock, verifyMock, refreshQueryMock];
      },
    });

    // Wait for generateOtp mutation to complete first
    await waitForApolloMocks(0); // Wait for first mock (CommonQuery)
    await waitForApolloMocks(1); // Wait for generateOtpMock

    // Wait for the component to finish loading (input appears after generateOtp completes)
    const input = await screen.findByPlaceholderText(/000000/i);
    const submitButton = screen.getByText(/Activate 2FA/i);

    await userEvent.type(input, token);
    await userEvent.click(submitButton);
    // Wait for verify mock (index 2) and refresh query (index 3)
    await waitForApolloMocks(2); // Wait for verify mock
    await waitForApolloMocks(3); // Wait for refresh query

    expect(closeModal).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenNthCalledWith(1, 'auth', 'otp-generate');
    expect(trackEvent).toHaveBeenNthCalledWith(2, 'auth', 'otp-verify');
  });

  it('should display error message if token is invalid', async () => {
    const token = '111111';
    const errorMessage = 'Verification token is invalid';
    const generateOtpMock = getGenerateOtpMock();
    // Remove data field so composeMockedQueryResult uses error field instead of result.errors
    const verifyMock = composeMockedQueryResult(verifyOtpMutation, {
      variables: { input: { otpToken: token } },
      data: {},
      errors: [
        new GraphQLError('GraphQlValidationError', {
          extensions: { token: [{ message: errorMessage, code: errorMessage }] },
        }),
      ],
    });

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (apolloMocks) => [...apolloMocks, generateOtpMock, verifyMock],
    });

    // Wait for generateOtp mutation to complete first
    await waitForApolloMocks(0); // Wait for first mock (CommonQuery)
    await waitForApolloMocks(1); // Wait for generateOtpMock

    // Wait for the component to finish loading (input appears after generateOtp completes)
    const input = await screen.findByPlaceholderText(/000000/i);
    const submitButton = screen.getByText(/Activate 2FA/i);

    await userEvent.type(input, token);
    await userEvent.click(submitButton);

    // Wait for error to be processed and displayed (don't use waitForApolloMocks for error mocks)
    expect(await screen.findByText(errorMessage, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
