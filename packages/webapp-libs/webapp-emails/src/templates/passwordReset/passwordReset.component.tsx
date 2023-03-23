import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core//hooks';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { FormattedMessage } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type PasswordResetProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: PasswordResetProps) => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.passwordReset.confirm, {
    token,
    user: userId,
  });

  return (
    <Layout
      title={<FormattedMessage defaultMessage="Reset the password" id="Email / Reset Password / Title" />}
      text={
        <FormattedMessage
          defaultMessage="Click the button below to reset the password. "
          id="Email / Reset Password / Text"
        />
      }
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
