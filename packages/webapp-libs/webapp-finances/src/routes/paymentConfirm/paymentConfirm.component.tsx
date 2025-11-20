import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { RoutesConfig as CoreRoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Elements } from '@stripe/react-stripe-js';
import { CreditCard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Payments',
          id: 'Finances / Stripe / Payment confirm / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Payments" id="Finances / Stripe / Payment confirm / heading" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Example of a single payment form powered by Stripe. You can make donations by selecting an amount and providing credit card details"
              id="Finances / Stripe / Payment confirm / subheading"
            />
          </Paragraph>
        </div>

        {/* Payment Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <FormattedMessage defaultMessage="Payment Details" id="Finances / Stripe / Payment form / Title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Complete your payment securely with Stripe"
                id="Finances / Stripe / Payment form / Description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ locale: 'en' }}>
              <StripePaymentForm
                onSuccess={() => {
                  navigate(generateLocalePath(CoreRoutesConfig.home));
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
