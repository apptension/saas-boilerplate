import { FormattedMessage, useIntl } from 'react-intl';
import { EmailComponentProps } from '../../types';
import { Button, Layout } from '../../base';
import { ROUTES } from '../../../routes/app.constants';
import { useGenerateLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';

export type AccountActivationProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: AccountActivationProps) => {
  const generateLocalPath = useGenerateLocalePath();
  const url = generateLocalPath(
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
