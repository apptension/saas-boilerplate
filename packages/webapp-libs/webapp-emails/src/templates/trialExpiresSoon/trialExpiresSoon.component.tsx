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
    defaultMessage: 'Upgrade now to keep all your data and settings',
    id: 'Email / Trial Expires Soon / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="Your free trial ends soon"
          id="Email / Trial Expires Soon / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="We hope you've been enjoying your trial! Your free access expires on {expiryDate}. Upgrade now to keep all your data, settings, and continue using all the features you love."
          id="Email / Trial Expires Soon / Text"
          values={{ expiryDate: <FormattedDate value={expiryDate} /> }}
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Upgrade now" id="Email / Trial Expires Soon / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage
    defaultMessage="Your free trial ends soon — don't lose access"
    id="Email / Trial Expires Soon / Subject"
  />
);
