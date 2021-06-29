import { FormattedMessage } from 'react-intl';
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
