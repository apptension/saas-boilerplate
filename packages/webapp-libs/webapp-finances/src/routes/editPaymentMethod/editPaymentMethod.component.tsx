import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
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
  const generateTenantPath = useGenerateTenantPath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment method changed successfully',
    id: 'Stripe edit payment method / successful message',
  });

  return (
    <PageLayout>
      <PageHeadline
        hasBackButton
        header={<FormattedMessage defaultMessage="Payment methods" id="Finances / Payment methods / heading" />}
        subheader={
          <FormattedMessage defaultMessage="Edit your payment methods" id="Finances / Payment methods / subheading" />
        }
      />

      <Elements stripe={stripePromise} options={{ locale: 'en' }}>
        <EditPaymentMethodForm
          onSuccess={() => {
            navigate(generateTenantPath(RoutesConfig.subscriptions.index));
            toast({ description: successMessage });
          }}
        />
      </Elements>
    </PageLayout>
  );
};
