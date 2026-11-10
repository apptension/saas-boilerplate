import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../../../tests/utils/rendering';
import { TwoFactorAuthForm, TwoFactorAuthFormProps } from '../twoFactorAuthForm.component';
import { disableOtpMutation, generateOtpMutation } from '../twoFactorAuthForm.graphql';

const user = currentUserFactory();

jest.mock('@sb/webapp-core/services/analytics');

describe('TwoFactorAuthForm: Component', () => {
  const defaultProps: TwoFactorAuthFormProps = {};

  const Component = (props: Partial<TwoFactorAuthFormProps>) => <TwoFactorAuthForm {...defaultProps} {...props} />;

  it('should open 2FA setup modal', async () => {
    const generateOtpMock = composeMockedQueryResult(generateOtpMutation, {
      variables: { input: {} },
      data: { generateOtp: { base32: 'base32string', otpauthUrl: 'otpAuthUrl' } },
    });

    render(<Component />, {
      apolloMocks: (apolloMocks) => apolloMocks.concat(generateOtpMock),
    });

    const setupButton = await screen.findByRole('button', { name: /enable 2fa/i });
    await userEvent.click(setupButton);

    expect(await screen.findByRole('dialog', { name: /Set Up Two-Factor Authentication/i })).toBeInTheDocument();
  });

  it('should disable 2FA', async () => {
    const disableOtpMock = composeMockedQueryResult(disableOtpMutation, {
      variables: { input: {} },
      data: { disableOtp: { ok: true } },
    });
    const refreshQueryMock = fillCommonQueryWithUser(user);

    render(<Component isEnabled />, {
      apolloMocks: (apolloMocks) => apolloMocks.concat(disableOtpMock, refreshQueryMock),
    });

    // Click the Disable button which opens confirmation dialog
    const disableButton = await screen.findByRole('button', { name: /disable/i });
    await userEvent.click(disableButton);

    // Confirm in the dialog
    const confirmButton = await screen.findByRole('button', { name: /continue/i });
    await userEvent.click(confirmButton);

    expect(await screen.findByText(/Two-Factor Auth disabled successfully!/i)).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith('auth', 'otp-disabled');
  });
});
