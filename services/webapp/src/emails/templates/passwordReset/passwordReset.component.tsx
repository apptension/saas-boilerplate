import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generatePath } from 'react-router-dom';
import { EmailComponentProps } from '../../types';
import { ROUTES } from '../../../routes/app.constants';
import { Layout, Button } from '../../base';

export interface PasswordResetProps extends EmailComponentProps {
  userId: string;
  token: string;
}

export const Template = ({ userId, token }: PasswordResetProps) => {
  const url = `${process.env.REACT_APP_WEB_APP_URL}/en${generatePath(ROUTES.passwordReset.confirm, {
    token,
    user: userId,
  })}`;

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
