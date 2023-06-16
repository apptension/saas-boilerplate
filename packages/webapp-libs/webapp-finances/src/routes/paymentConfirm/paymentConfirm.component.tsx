import { Separator } from '@sb/webapp-core/components/separator';
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
    <div className="px-8 space-y-6 flex-1 lg:max-w-2xl">
      <div>
        <h3 className="text-lg font-medium">
          <FormattedMessage defaultMessage="Payments" id="Finances / Stripe / Payment confirm / heading" />
        </h3>

        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            defaultMessage="This is an example of single payment form, like donation"
            id="Finances / Stripe / Payment confirm / subheading"
          />
        </p>
      </div>

      <Separator />

      <Elements stripe={stripePromise}>
        <StripePaymentForm
          onSuccess={() => {
            navigate(generateLocalePath(CoreRoutesConfig.home));
            toast({ description: successMessage });
          }}
        />
      </Elements>
    </div>
  );
};
