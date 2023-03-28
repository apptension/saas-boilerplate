import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core//hooks';
import { RoutesConfig } from '@sb/webapp-finances/config/routes';
import { FormattedMessage } from 'react-intl';

import { Button, Layout } from '../../base';

export const Template = () => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.subscriptions.index);

  return (
    <Layout
      title={
        <FormattedMessage defaultMessage="Your subscription payment failed" id="Email / Subscription Error / Title" />
      }
      text={
        <FormattedMessage
          defaultMessage="Click the button below to review your payment method details"
          id="Email / Subscription Error / Text"
        />
      }
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
