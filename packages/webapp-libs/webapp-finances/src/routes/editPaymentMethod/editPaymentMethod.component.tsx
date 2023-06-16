import { BackButton } from '@sb/webapp-core/components/buttons';
import { Separator } from '@sb/webapp-core/components/separator';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Elements } from '@stripe/react-stripe-js';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { stripePromise } from '../../services/stripe';
import { EditPaymentMethodForm } from './editPaymentMethodForm/editPaymentMethodForm.component';

export const EditPaymentMethod = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment method changed successfully',
    id: 'Stripe edit payment method / successful message',
  });

  return (
    <div className="px-8 space-y-6 flex-1 lg:max-w-2xl">
      <div>
        <BackButton className="float-right" />
        <h3 className="text-lg font-medium">
          <FormattedMessage defaultMessage="Payment methods" id="Finances / Payment methods / heading" />
        </h3>

        <p className="text-sm text-muted-foreground">
          <FormattedMessage defaultMessage="Edit your payment methods" id="Finances / Payment methods / subheading" />
        </p>
      </div>

      <Separator />

      <Elements stripe={stripePromise}>
        <EditPaymentMethodForm
          onSuccess={() => {
            navigate(generateLocalePath(RoutesConfig.subscriptions.index));
            toast({ description: successMessage });
          }}
        />
      </Elements>
    </div>
  );
};
