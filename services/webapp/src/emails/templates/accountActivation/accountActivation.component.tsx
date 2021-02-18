import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { EmailComponentProps } from '../../types';
import { Td, Tr } from '../../base';
import { Container } from './accountActivation.styles';

interface AccountActivationProps extends EmailComponentProps {
  userId: string;
  token: string;
}

export const Template = ({ webAppUrl, userId, token }: AccountActivationProps) => {
  const url = `${webAppUrl}/en/auth/confirm/${userId}/${token}`;

  return (
    <Container>
      <Tr>
        <Td>
          <FormattedMessage defaultMessage="Activation link: " description="Email / account activation / title" />
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
        defaultMessage: 'Confirm your account',
        description: 'Email / account activation / subject',
      })}
    </>
  );
};
