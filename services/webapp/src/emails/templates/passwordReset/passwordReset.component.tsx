import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { generatePath } from 'react-router-dom';
import { EmailComponentProps } from '../../types';
import { Td, Tr } from '../../base';
import { ROUTES } from '../../../routes/app.constants';
import { Container } from './passwordReset.styles';

export interface PasswordResetProps extends EmailComponentProps {
  userId: string;
  token: string;
}

export const Template = ({ webAppUrl, userId, token }: PasswordResetProps) => {
  const url = `${webAppUrl}/en${generatePath(ROUTES.passwordReset.confirm, { token, user: userId })}`;

  return (
    <Container>
      <Tr>
        <Td>
          <FormattedMessage defaultMessage="Reset link: " description="Email / reset password / title" />
        </Td>
      </Tr>

      <Tr>
        <Td>
          <a href={url}>{url}</a>
        </Td>
      </Tr>
    </Container>
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
