import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type AccountActivationProps = EmailComponentProps & {
  userId: string;
  token: string;
};

export const Template = ({ userId, token }: AccountActivationProps) => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.confirmEmail, {
    token,
    user: userId,
  });

  return (
    <Layout
      title={<FormattedMessage defaultMessage="Finish the registration" id="Email / Account Activation / Title" />}
      text={
        <FormattedMessage
          defaultMessage="Click the button below to confirm registration."
          id="Email / Account Activation / Text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Confirm registration" id="Email / Account Activation / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Confirm registration" id="Email / Account Activation / Subject" />
);
