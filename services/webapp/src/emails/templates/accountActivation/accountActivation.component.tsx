import { FormattedMessage } from 'react-intl';
import { EmailComponentProps } from '../../types';
import { Button, Layout } from '../../base';
import { ROUTES } from '../../../routes/app.constants';
import { useGenerateLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';

export type AccountActivationProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: AccountActivationProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const url = generateLocalePath(
    ROUTES.confirmEmail,
    {
      token,
      user: userId,
    },
    { absolute: true }
  );

  return (
    <Layout
      title={
        <FormattedMessage defaultMessage="Finish the registration" description="Email / Account Activation / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Click the button below to confirm registration."
          description="Email / Account Activation / Text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Confirm registration" description="Email / Account Activation / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Confirm registration" description="Email / Account Activation / Subject" />
);
