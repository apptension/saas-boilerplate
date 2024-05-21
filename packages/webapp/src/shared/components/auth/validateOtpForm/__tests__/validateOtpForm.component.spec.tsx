import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { append } from 'ramda';

import { render } from '../../../../../tests/utils/rendering';
import { validateOtpMutation } from '../../twoFactorAuthForm/twoFactorAuthForm.graphql';
import { ValidateOtpForm } from '../validateOtpForm.component';

const mockNavigate = jest.fn();

jest.mock('@sb/webapp-core/services/analytics');

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual<NodeModule>('react-router-dom'),
    useNavigate: () => mockNavigate,
  };
});

const Component = () => <ValidateOtpForm />;

const tokensMock = { access: 'access-token', refresh: 'refresh-token' };
const user = currentUserFactory();

describe('ValidateOtpForm: Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('should call trackEvent after successful validation', async () => {
    const token = '331553';
    const requestMock = composeMockedQueryResult(validateOtpMutation, {
      variables: { input: { otpToken: token } },
      data: { validateOtp: tokensMock },
    });

    const refreshQueryMock = fillCommonQueryWithUser(user);

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (mocks) => mocks.concat(requestMock, refreshQueryMock),
    });

    const input = await screen.findByPlaceholderText(/Authentication Code/i);
    const submitButton = screen.getByText(/Submit/i);

    await userEvent.type(input, token);
    await userEvent.click(submitButton);
    await waitForApolloMocks();

    expect(trackEvent).toHaveBeenCalledWith('auth', 'otp-validate');
  });

  it('should display error if token is invalid', async () => {
    const token = '111111';
    const errorMessage = 'Verification token is invalid';
    const requestMock = composeMockedQueryResult(validateOtpMutation, {
      variables: { input: { otpToken: token } },
      data: { validateOtp: null },
      errors: [
        new GraphQLError('GraphQlValidationError', {
          extensions: { token: [{ message: errorMessage, code: errorMessage }] },
        }),
      ],
    });

    const { waitForApolloMocks } = render(<Component />, { apolloMocks: append(requestMock) });

    const input = await screen.findByPlaceholderText(/Authentication Code/i);
    const submitButton = screen.getByText(/Submit/i);

    await userEvent.type(input, token);
    await userEvent.click(submitButton);
    await waitForApolloMocks();

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
