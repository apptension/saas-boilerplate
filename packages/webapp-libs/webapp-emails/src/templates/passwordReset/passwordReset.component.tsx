import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type PasswordResetProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: PasswordResetProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.passwordReset.confirm, {
    token,
    user: userId,
  });

  const preheaderText = intl.formatMessage({
    defaultMessage: 'Reset your password to regain access to your account',
    id: 'Email / Reset Password / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={<FormattedMessage defaultMessage="Reset the password" id="Email / Reset Password / Title" />}
      text={
        <FormattedMessage
          defaultMessage="Click the button below to reset the password."
          id="Email / Reset Password / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Reset the password" id="Email / Reset Password / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Reset your password" id="Email / Reset Password / Subject" />
);
