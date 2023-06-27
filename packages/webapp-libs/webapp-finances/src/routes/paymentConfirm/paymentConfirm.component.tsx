import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { RoutesConfig as CoreRoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Elements } from '@stripe/react-stripe-js';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { StripePaymentForm } from '../../components/stripe';
import { stripePromise } from '../../services/stripe';

export const PaymentConfirm = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment successful',
    id: 'Stripe payment confirm / payment successful',
  });

  return (
    <PageLayout>
      <PageHeadline
        header={<FormattedMessage defaultMessage="Payments" id="Finances / Stripe / Payment confirm / heading" />}
        subheader={
          <FormattedMessage
            defaultMessage="Example of a single payment form powered by Stripe. You can make donations by selecting an amount and providing credit card details"
            id="Finances / Stripe / Payment confirm / subheading"
          />
        }
      />

      <Elements stripe={stripePromise} options={{ locale: 'en' }}>
        <StripePaymentForm
          onSuccess={() => {
            navigate(generateLocalePath(CoreRoutesConfig.home));
            toast({ description: successMessage });
          }}
        />
      </Elements>
    </PageLayout>
  );
};
