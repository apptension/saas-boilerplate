import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { H1, H4, Paragraph, Small } from '@sb/webapp-core/components/typography';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import * as QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generateOtpMutation, verifyOtpMutation } from '../twoFactorAuthForm/twoFactorAuthForm.graphql';
import { VerifyOtpFormFields } from './addTwoFactorAuth.types';

export type AddTwoFactorAuthProps = {
  closeModal: () => void;
};

const bTag = (chunks: React.ReactNode[]) => <b>{chunks}</b>;
const spanTag = (chunks: React.ReactNode[]) => <span>{chunks}</span>;

export const AddTwoFactorAuth = ({ closeModal }: AddTwoFactorAuthProps) => {
  const intl = useIntl();
  const { toast } = useToast();
  const { reload } = useCommonQuery();

  const [base32, setBase32] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [otpAuthUrl, setOtpAuthUrl] = useState('');

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
    defaultMessage: '🎉 Two-Factor Auth Enabled Successfully!',
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
    toast({ description: successMessage });
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
    <div aria-hidden={true} className="max-h-[92vh] w-auto overflow-y-auto p-2 text-left">
      <div className="px-4">
        <H1 className="text-lg lg:text-xl">
          <FormattedMessage
            defaultMessage="Configuring Google Authenticator or Authy"
            id="Auth / Add Two-factor / Configuring authenticator"
          />
        </H1>
        <Separator className="mb-2 mt-1" />
        <ol className="flex list-none flex-col gap-2 pl-0">
          <li className="text-sm">
            <FormattedMessage
              defaultMessage="Install Google Authenticator (IOS - Android) or Authy (IOS - Android)."
              id="Auth / Add Two-factor / Install authenticator app"
            />
          </li>
          <li className="text-sm">
            <FormattedMessage
              defaultMessage={`In the authenticator app, select "+" icon.`}
              id="Auth / Add Two-factor / Click add icon"
            />
          </li>
          <li className="text-sm">
            <FormattedMessage
              defaultMessage={`Select "Scan a barcode (or QR code)" and use the phone's camera to scan this barcode.`}
              id="Auth / Add Two-factor / Use camera to scan qr code"
            />
          </li>
        </ol>
        <div>
          <H4 className="mt-4 text-lg">
            <FormattedMessage defaultMessage="Scan QR Code" id="Auth / Add Two-factor / Scan QR Code" />
          </H4>
          <Separator className="mb-2 mt-1" />
          <div className="flex justify-center p-4">
            <img src={qrCodeUrl} alt="qrcode url" className="h-64 w-64" />
          </div>
        </div>
        <div>
          <H4 className="mt-4 text-lg">
            <FormattedMessage
              defaultMessage="Or Enter Code Into Your App"
              id="Auth / Add Two-factor / Enter code in app"
            />
          </H4>
          <Separator className="mb-2 mt-1" />
          <Paragraph firstChildMargin={false} className="my-0 text-sm">
            <FormattedMessage
              defaultMessage="SecretKey: <b>{base32}</b> <span>(Base32 encoded)</span>"
              id="Auth / Add Two-factor / Secret key encoded"
              values={{
                b: bTag,
                span: spanTag,
                base32,
              }}
            />
          </Paragraph>
        </div>
        <div>
          <H4 className="mt-4 text-lg">
            <FormattedMessage defaultMessage="Verify Code" id="Auth / Add Two-factor / Verify Code" />
          </H4>
          <Separator className="mb-2 mt-1" />
          <Paragraph firstChildMargin={false} className="my-0 text-sm">
            <FormattedMessage
              defaultMessage="For changing the setting, please verify the authentication code"
              id="Auth / Add Two-factor / Verify code for changing the setting"
            />
            :
          </Paragraph>
        </div>
        <form className="relative" onSubmit={handleSubmit(submitHandler)}>
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
            pattern="[0-9]*"
            placeholder="Authentication Code"
            maxLength={6}
            autoFocus
            error={errors.token?.message}
            autoComplete="off"
            className="mb-8 mt-4 w-48"
          />

          {hasGenericErrorOnly ? <Small className="absolute top-11 text-red-500">{genericError}</Small> : null}

          <div className="flex flex-row gap-4">
            <Button type="button" variant={ButtonVariant.SECONDARY} onClick={closeModal}>
              <FormattedMessage defaultMessage="Close" id="Auth / Add Two-factor / Close button" />
            </Button>
            <Button type="submit">
              <FormattedMessage
                defaultMessage="Verify & Activate"
                id="Auth / Add Two-factor / Verify & Activate button"
              />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
