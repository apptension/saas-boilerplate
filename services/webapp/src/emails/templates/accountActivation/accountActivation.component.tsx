import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generatePath } from 'react-router-dom';
import { EmailComponentProps } from '../../types';
import { Button, Layout } from '../../base';
import { ROUTES } from '../../../routes/app.constants';

export interface AccountActivationProps extends EmailComponentProps {
  userId: string;
  token: string;
}

export const Template = ({ webAppUrl, userId, token }: AccountActivationProps) => {
  const url = `${webAppUrl}/en${generatePath(ROUTES.confirmEmail, { token, user: userId })}`;

  return (
    <Layout
      title={
        <FormattedMessage defaultMessage="Finish the registration" description="Email / Account activation / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Click the button below to confirm registration."
          description="Email / Account activation / Text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Confirm registration" description="Email / Account activation / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => {
  const intl = useIntl();
  return (
    <>
      {intl.formatMessage({
        defaultMessage: 'Confirm registration',
        description: 'Email / Account activation / Subject',
      })}
    </>
  );
};
