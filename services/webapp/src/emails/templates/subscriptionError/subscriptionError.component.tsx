import { FormattedMessage } from 'react-intl';
import { RoutesConfig } from '../../../app/config/routes';
import { Button, Layout } from '../../base';
import { useGenerateAbsoluteLocalePath } from '../../../shared/hooks/localePaths';

export const Template = () => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.subscriptions.index);

  return (
    <Layout
      title={
        <FormattedMessage
          defaultMessage="Your subscription payment failed"
          description="Email / Subscription Error / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Click the button below to review your payment method details"
          description="Email / Subscription Error / Text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage
          defaultMessage="See subscription details"
          description="Email / Subscription Error / Link label"
        />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="Subscription payment failed" description="Email / Subscription Error / Subject" />
);
