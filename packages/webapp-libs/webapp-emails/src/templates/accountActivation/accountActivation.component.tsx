import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type AccountActivationProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: AccountActivationProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.confirmEmail, {
    token,
    user: userId,
  });

  const preheaderText = intl.formatMessage({
    defaultMessage: "You're one click away from getting started",
    id: 'Email / Account Activation / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage defaultMessage="Welcome! Let's verify your email" id="Email / Account Activation / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Thanks for signing up! Please confirm your email address to activate your account and start exploring all the features waiting for you."
          id="Email / Account Activation / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Verify my email" id="Email / Account Activation / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Verify your email to get started" id="Email / Account Activation / Subject" />
);
