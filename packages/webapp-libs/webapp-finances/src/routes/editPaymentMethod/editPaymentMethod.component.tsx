import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, Link } from 'react-router-dom';

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
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Edit Payment Methods',
          id: 'Finances / Payment methods / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <Link
            to={generateTenantPath(RoutesConfig.subscriptions.paymentMethods.index)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to payment methods" id="Finances / Payment methods / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Payment methods" id="Finances / Payment methods / heading" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage defaultMessage="Edit your payment methods" id="Finances / Payment methods / subheading" />
          </Paragraph>
        </div>

        {/* Payment Method Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <FormattedMessage defaultMessage="Payment Method Details" id="Finances / Payment methods / Form Title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Update or add a new payment method for your subscription"
                id="Finances / Payment methods / Form Description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ locale: 'en' }}>
              <EditPaymentMethodForm
                onSuccess={() => {
                  navigate(generateTenantPath(RoutesConfig.subscriptions.index));
                  toast({ description: successMessage });
                }}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
