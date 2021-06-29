import { FormattedMessage } from 'react-intl';
import { ROUTES } from '../../../routes/app.constants';
import { Button, Layout } from '../../base';
import { useGenerateLocalePath } from '../../../routes/useLanguageFromParams/useLanguageFromParams.hook';

export const Template = () => {
  const generateLocalePath = useGenerateLocalePath();
  const url = generateLocalePath(ROUTES.subscriptions.index, {}, { absolute: true });

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
