import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
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
    const verifyMock = composeMockedQueryResult(verifyOtpMutation, {
      variables: { input: { otpToken: token } },
      data: { verifyOtp: { otpVerified: true } },
    });
    const otpMocks = [verifyMock, getGenerateOtpMock()];

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (apolloMocks) => apolloMocks.concat(otpMocks, refreshQueryMock),
    });

    const input = await screen.findByPlaceholderText(/Authentication Code/i);
    const submitButton = screen.getByText(/Verify & Activate/i);

    await userEvent.type(input, token);
    await userEvent.click(submitButton);
    await waitForApolloMocks();

    expect(closeModal).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenNthCalledWith(1, 'auth', 'otp-generate');
    expect(trackEvent).toHaveBeenNthCalledWith(2, 'auth', 'otp-verify');
  });

  it('should display error message if token is invalid', async () => {
    const token = '111111';
    const errorMessage = 'Verification token is invalid';
    const verifyMock = composeMockedQueryResult(verifyOtpMutation, {
      variables: { input: { otpToken: token } },
      data: { verifyOtp: null },
      errors: [
        new GraphQLError('GraphQlValidationError', {
          extensions: { token: [{ message: errorMessage, code: errorMessage }] },
        }),
      ],
    });
    const otpMocks = [verifyMock, getGenerateOtpMock()];

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (apolloMocks) => apolloMocks.concat(otpMocks),
    });

    const input = await screen.findByPlaceholderText(/Authentication Code/i);
    const submitButton = screen.getByText(/Verify & Activate/i);

    await userEvent.type(input, token);
    await userEvent.click(submitButton);
    await waitForApolloMocks();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
