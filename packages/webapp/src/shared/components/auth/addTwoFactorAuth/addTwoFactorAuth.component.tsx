import { useMutation } from '@apollo/client/react';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Small } from '@sb/webapp-core/components/typography';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Copy, KeyRound, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import * as QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generateOtpMutation, verifyOtpMutation } from '../twoFactorAuthForm/twoFactorAuthForm.graphql';
import { VerifyOtpFormFields } from './addTwoFactorAuth.types';

export type AddTwoFactorAuthProps = {
  closeModal: () => void;
};

export const AddTwoFactorAuth = ({ closeModal }: AddTwoFactorAuthProps) => {
  const intl = useIntl();
  const { toast } = useToast();
  const { reload } = useCommonQuery();

  const [base32, setBase32] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const form = useApiForm<VerifyOtpFormFields>();

  const {
    handleSubmit,
    hasGenericErrorOnly,
    genericError,
    setApolloGraphQLResponseErrors,
    form: {
      register,
      formState: { errors },
    },
  } = form;

  const successMessage = intl.formatMessage({
    id: 'Auth / Add Two-factor / Success message',
    defaultMessage: 'Two-Factor Auth enabled successfully!',
  });

  const [commitVerifyOtpMutation] = useMutation(verifyOtpMutation, {
    onError: (error) => setApolloGraphQLResponseErrors(error.graphQLErrors),
    onCompleted: () => {
      trackEvent('auth', 'otp-verify');
    },
  });

  const [commitGenerateOtpMutation] = useMutation(generateOtpMutation, {
    variables: { input: {} },
    onCompleted: () => {
      trackEvent('auth', 'otp-generate');
    },
  });

  const submitHandler = async (values: { token: string }) => {
    const { data } = await commitVerifyOtpMutation({ variables: { input: { otpToken: values.token } } });

    const isOtpVerified = data?.verifyOtp?.otpVerified;
    if (!isOtpVerified) return;

    reload();
    closeModal();
    toast({ description: successMessage, variant: 'success' });
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(base32);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Secret key copied to clipboard',
          id: 'Auth / Add Two-factor / Key copied',
        }),
        variant: 'success',
      });
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to copy key',
          id: 'Auth / Add Two-factor / Key copy failed',
        }),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!otpAuthUrl) return;
    QRCode.toDataURL(otpAuthUrl, { scale: 8 }).then(setQrCodeUrl);
  }, [otpAuthUrl]);

  useEffect(() => {
    const getOtpData = async () => {
      const { data } = await commitGenerateOtpMutation();

      const base32 = data?.generateOtp?.base32;
      const otpAuthPathUrl = data?.generateOtp?.otpauthUrl;
      if (!base32 || !otpAuthPathUrl) return;

      setBase32(base32);
      setOtpAuthUrl(otpAuthPathUrl);
    };
    getOtpData();
  }, [commitGenerateOtpMutation]);

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="-m-6 flex h-[85vh] max-h-[700px] flex-col overflow-hidden sm:rounded-lg">
      {/* Fixed Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-6 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="mr-8">
          <h2 className="text-lg font-semibold">
            <FormattedMessage
              defaultMessage="Set Up Two-Factor Authentication"
              id="Auth / Add Two-factor / Configuring authenticator"
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              defaultMessage="Secure your account with an authenticator app"
              id="Auth / Add Two-factor / Subtitle"
            />
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Step 1: Install App */}
        <div className="flex gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            1
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-medium">
              <FormattedMessage defaultMessage="Install Authenticator App" id="Auth / Add Two-factor / Step 1 title" />
            </h3>
            <p className="text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="Download Google Authenticator or Authy on your mobile device from the App Store or Google Play."
                id="Auth / Add Two-factor / Install authenticator app"
              />
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                <FormattedMessage defaultMessage="iOS & Android" id="Auth / Add Two-factor / Platforms" />
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Scan QR Code */}
        <div className="flex gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            2
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-sm font-medium">
              <FormattedMessage defaultMessage="Scan QR Code" id="Auth / Add Two-factor / Scan QR Code" />
            </h3>
            <p className="text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="Open your authenticator app and scan the QR code below."
                id="Auth / Add Two-factor / Use camera to scan qr code"
              />
            </p>

            {/* QR Code Card */}
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-white p-4 dark:bg-muted/30">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="h-40 w-40" />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center">
                  <QrCode className="h-8 w-8 animate-pulse text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Manual Entry Option */}
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  <FormattedMessage
                    defaultMessage="Can't scan? Enter this key manually:"
                    id="Auth / Add Two-factor / Enter code in app"
                  />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-2 py-1.5 font-mono text-xs">
                  {base32 || '...'}
                </code>
                <Button
                  type="button"
                  variant={ButtonVariant.SECONDARY}
                  onClick={handleCopyKey}
                  className="h-8 w-8 shrink-0 p-0"
                  disabled={!base32}
                >
                  <Copy className={`h-3.5 w-3.5 ${copied ? 'text-green-500' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Verify */}
        <div className="flex gap-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            3
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-sm font-medium">
              <FormattedMessage defaultMessage="Enter Verification Code" id="Auth / Add Two-factor / Verify Code" />
            </h3>
            <p className="text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="Enter the 6-digit code from your authenticator app to complete setup."
                id="Auth / Add Two-factor / Verify code for changing the setting"
              />
            </p>

            <Input
              {...register('token', {
                required: {
                  value: true,
                  message: intl.formatMessage({
                    defaultMessage: 'The authentication code is required',
                    id: 'Auth / Validate OTP / Auth code required',
                  }),
                },
                minLength: {
                  value: 6,
                  message: intl.formatMessage({
                    defaultMessage: 'The authentication code must be 6 characters long.',
                    id: 'Auth / Validate OTP / Password too short',
                  }),
                },
              })}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              maxLength={6}
              autoFocus
              error={errors.token?.message}
              autoComplete="one-time-code"
              className="w-full max-w-[160px] text-center font-mono text-lg tracking-widest"
            />

            {hasGenericErrorOnly && (
              <div className="text-sm text-destructive">
                <Small>{genericError}</Small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex shrink-0 gap-3 border-t bg-background px-6 py-4">
        <Button type="button" variant={ButtonVariant.SECONDARY} onClick={closeModal} className="flex-1">
          <FormattedMessage defaultMessage="Cancel" id="Auth / Add Two-factor / Close button" />
        </Button>
        <Button type="submit" className="flex-1">
          <ShieldCheck className="mr-2 h-4 w-4" />
          <FormattedMessage defaultMessage="Activate 2FA" id="Auth / Add Two-factor / Verify & Activate button" />
        </Button>
      </div>
    </form>
  );
};
