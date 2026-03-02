import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { RoutesConfig } from '@sb/webapp-finances/config/routes';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout } from '../../base';

export const Template = () => {
  const intl = useIntl();
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.subscriptions.index);

  const preheaderText = intl.formatMessage({
    defaultMessage: "Let's fix this quickly to keep your access uninterrupted",
    id: 'Email / Subscription Error / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="We couldn't process your payment"
          id="Email / Subscription Error / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Don't worry, this happens sometimes. Your payment method may have expired or there might be insufficient funds. Please update your payment details to continue enjoying uninterrupted access to your account."
          id="Email / Subscription Error / Text"
        />
      }
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Update payment method" id="Email / Subscription Error / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage
    defaultMessage="Action needed: Update your payment method"
    id="Email / Subscription Error / Subject"
  />
);
