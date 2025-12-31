import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { FormattedDate } from '@sb/webapp-core/components/dateTime';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type TrialExpiresSoonProps = EmailComponentProps & {
  expiryDate: string;
};

export const Template = ({ expiryDate }: TrialExpiresSoonProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.home);

  const preheaderText = intl.formatMessage({
    defaultMessage: 'Your trial period is ending soon - upgrade to continue',
    id: 'Email / Trial Expires Soon / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage defaultMessage="Your trial is about to expire" id="Email / Trial Expires Soon / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Your trial is about to expire on {expiryDate}, please take action"
          id="Email / Trial Expires Soon / Text"
          values={{ expiryDate: <FormattedDate value={expiryDate} /> }}
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Go to the dashboard" id="Email / Trial Expires Soon / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Your trial is about to expire" id="Email / Trial Expires Soon / Subject" />
);
