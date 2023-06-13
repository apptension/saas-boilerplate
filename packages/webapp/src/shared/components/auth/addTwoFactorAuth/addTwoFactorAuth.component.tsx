import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import * as QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generateOtpMutation, verifyOtpMutation } from '../twoFactorAuthForm/twoFactorAuthForm.graphql';
import {
  Body,
  BodyParagraph,
  CodeForm,
  CodeInput,
  ConfigList,
  ConfigListItem,
  Container,
  ErrorMessage,
  InlineButtons,
  MainHeader,
  QRCodeContainer,
  QRCodeImg,
  SectionHeader,
} from './addTwoFactorAuth.styles';
import { VerifyOtpFormFields } from './addTwoFactorAuth.types';

export type AddTwoFactorAuthProps = {
  closeModal: () => void;
};

const bTag = (chunks: React.ReactNode[]) => <b>{chunks}</b>;
const spanTag = (chunks: React.ReactNode[]) => <span>{chunks}</span>;

export const AddTwoFactorAuth = ({ closeModal }: AddTwoFactorAuthProps) => {
  const [qrcodeUrl, setqrCodeUrl] = useState('');
  const [base32, setBase32] = useState('');
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const intl = useIntl();
  const { toast } = useToast();
  const { reload } = useCommonQuery();

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
    QRCode.toDataURL(otpAuthUrl, { scale: 8 }).then(setqrCodeUrl);
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
    <Container aria-hidden={true}>
      <Body>
        <MainHeader>
          <FormattedMessage
            defaultMessage="Configuring Google Authenticator or Authy"
            id="Auth / Add Two-factor / Configuring authenticator"
          />
        </MainHeader>
        <ConfigList>
          <ConfigListItem>
            <FormattedMessage
              defaultMessage="Install Google Authenticator (IOS - Android) or Authy (IOS - Android)."
              id="Auth / Add Two-factor / Install authenticator app"
            />
          </ConfigListItem>
          <ConfigListItem>
            <FormattedMessage
              defaultMessage={`In the authenticator app, select "+" icon.`}
              id="Auth / Add Two-factor / Click add icon"
            />
          </ConfigListItem>
          <ConfigListItem>
            <FormattedMessage
              defaultMessage={`Select "Scan a barcode (or QR code)" and use the phone's camera to scan this barcode.`}
              id="Auth / Add Two-factor / Use camera to scan qr code"
            />
          </ConfigListItem>
        </ConfigList>
        <div>
          <SectionHeader>
            <FormattedMessage defaultMessage="Scan QR Code" id="Auth / Add Two-factor / Scan QR Code" />
          </SectionHeader>
          <QRCodeContainer>
            <QRCodeImg src={qrcodeUrl} alt="qrcode url" />
          </QRCodeContainer>
        </div>
        <div>
          <SectionHeader>
            <FormattedMessage
              defaultMessage="Or Enter Code Into Your App"
              id="Auth / Add Two-factor / Enter code in app"
            />
          </SectionHeader>
          <BodyParagraph>
            <FormattedMessage
              defaultMessage="SecretKey: <b>{base32}</b> <span>(Base32 encoded)</span>"
              id="Auth / Add Two-factor / Secret key encoded"
              values={{
                b: bTag,
                span: spanTag,
                base32,
              }}
            />
          </BodyParagraph>
        </div>
        <div>
          <SectionHeader>
            <FormattedMessage defaultMessage="Verify Code" id="Auth / Add Two-factor / Verify Code" />
          </SectionHeader>
          <BodyParagraph>
            <FormattedMessage
              defaultMessage="For changing the setting, please verify the authentication code"
              id="Auth / Add Two-factor / Verify code for changing the setting"
            />
            :
          </BodyParagraph>
        </div>
        <CodeForm onSubmit={handleSubmit(submitHandler)}>
          <CodeInput
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
          />
          {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}
          <InlineButtons>
            <Button type="button" variant={ButtonVariant.SECONDARY} onClick={closeModal}>
              <FormattedMessage defaultMessage="Close" id="Auth / Add Two-factor / Close button" />
            </Button>
            <Button type="submit">
              <FormattedMessage
                defaultMessage="Verify & Activate"
                id="Auth / Add Two-factor / Verify & Activate button"
              />
            </Button>
          </InlineButtons>
        </CodeForm>
      </Body>
    </Container>
  );
};
