import { useQuery } from '@apollo/client/react';
import { getFragmentData } from '@sb/webapp-api-client/graphql';
import { Link } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { CreditCard, Wallet } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { StripePaymentMethodInfo } from '../../components/stripe/stripePaymentMethodInfo';
import { RoutesConfig } from '../../config/routes';
import { subscriptionActivePlanDetailsQuery, subscriptionActiveSubscriptionFragment } from '../../hooks';

const PaymentMethodContent = () => {
  const generateTenantPath = useGenerateTenantPath();

  const { allPaymentMethods } = useActiveSubscriptionDetails();
  const { data: currentTenant } = useCurrentTenant();

  const { data } = useQuery(subscriptionActivePlanDetailsQuery, {
    variables: {
      tenantId: currentTenant?.id ?? '',
    },
    skip: !currentTenant?.id,
  });

  const activeSubscription = getFragmentData(subscriptionActiveSubscriptionFragment, data?.activeSubscription);

  const paymentMethods = mapConnection((plan) => plan, allPaymentMethods);
  const defaultMethod = paymentMethods.find(({ id }) => id === activeSubscription?.defaultPaymentMethod?.id);

  const renderCardDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage defaultMessage="Current method:" id="My subscription / Current method" />
        </CardTitle>
        <CardDescription>
          <FormattedMessage defaultMessage="Credit card" id="My subscription / Credit card" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-2 border rounded-md bg-secondary">
          <StripePaymentMethodInfo method={defaultMethod} />
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyList = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Wallet className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        <FormattedMessage defaultMessage="No payment methods" id="My subscription / No payment methods title" />
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        <FormattedMessage
          defaultMessage="You don't have any payment method added. Add a card to enable subscription purchases."
          id="My subscription / No credit card"
        />
      </p>
    </div>
  );

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.subscriptions.paymentMethods.index)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <FormattedMessage defaultMessage="Payment methods" id="My subscription / Payment methods header" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Manage your payment methods in application"
                id="My subscription / Payment methods subheader"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultMethod && renderCardDetails()}
            {paymentMethods.length === 0 && renderEmptyList()}
            <div>
              <Link to={generateTenantPath(RoutesConfig.subscriptions.paymentMethods.edit)} variant="default">
                {paymentMethods.length ? (
                  <FormattedMessage
                    defaultMessage="Edit payment methods"
                    id="My subscription / Edit payment method button"
                  />
                ) : (
                  <FormattedMessage
                    defaultMessage="Add payment methods"
                    id="My subscription / Add payment method button"
                  />
                )}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default PaymentMethodContent;
