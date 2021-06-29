import { FormattedMessage, useIntl } from 'react-intl';
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
          description="Email / Subscription Error / title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Click the button below to review your payment method details"
          description="Email / Subscription Error / text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage
          defaultMessage="See subscription details"
          description="Email / Subscription Error / link label"
        />
      </Button>
    </Layout>
  );
};

export const Subject = () => {
  const intl = useIntl();
  return (
    <>
      {intl.formatMessage({
        defaultMessage: 'Subscription payment failed',
        description: 'Email / Subscription Error / subject',
      })}
    </>
  );
};
