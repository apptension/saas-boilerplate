import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { EmailComponentProps } from '../../types';
import { ROUTES } from '../../../routes/app.constants';
import { Button, Layout } from '../../base';
import { useGenerateLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';

export type PasswordResetProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: PasswordResetProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const url = generateLocalePath(
    ROUTES.passwordReset.confirm,
    {
      token,
      user: userId,
    },
    { absolute: true }
  );

  return (
    <Layout
      title={<FormattedMessage defaultMessage="Reset the password" description="Email / Reset password / title" />}
      text={
        <FormattedMessage
          defaultMessage="Click the button below to reset the password. "
          description="Email / Reset password / text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Reset the password" description="Email / Reset password / link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => {
  const intl = useIntl();
  return (
    <>
      {intl.formatMessage({
        defaultMessage: 'Reset your password',
        description: 'Email / reset password / subject',
      })}
    </>
  );
};
