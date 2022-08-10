import { FormattedMessage } from 'react-intl';
import { EmailComponentProps } from '../../types';
import { Routes } from '../../../app/config/routes';
import { Button, Layout } from '../../base';
import { useGenerateAbsoluteLocalePath } from '../../../shared/hooks/localePaths';

export type PasswordResetProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: PasswordResetProps) => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(Routes.passwordReset.confirm, {
    token,
    user: userId,
  });

  return (
    <Layout
      title={<FormattedMessage defaultMessage="Reset the password" description="Email / Reset Password / Title" />}
      text={
        <FormattedMessage
          defaultMessage="Click the button below to reset the password. "
          description="Email / Reset Password / Text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Reset the password" description="Email / Reset Password / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Reset your password" description="Email / Reset Password / Subject" />
);
