import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { RoutesConfig } from '@sb/webapp-finances/config/routes';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout } from '../../base';

export const Template = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.subscriptions.index);

  const preheaderText = intl.formatMessage({
    defaultMessage: 'Action required: Your subscription payment could not be processed',
    id: 'Email / Subscription Error / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage defaultMessage="Your subscription payment failed" id="Email / Subscription Error / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Click the button below to review your payment method details"
          id="Email / Subscription Error / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="See subscription details" id="Email / Subscription Error / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Subscription payment failed" id="Email / Subscription Error / Subject" />
);
