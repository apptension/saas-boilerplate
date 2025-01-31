import { useQuery } from '@apollo/client';
import { getFragmentData } from '@sb/webapp-api-client/graphql';
import { Link } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
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
    <div className="mt-1 text-muted-foreground text-sm">
      <FormattedMessage
        defaultMessage="You don't have any payment method added."
        id="My subscription / No credit card"
      />
    </div>
  );

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.subscriptions.paymentMethods.index)}>
      <div className="space-y-6 pt-4">
        <PageHeadline
          header={<FormattedMessage defaultMessage="Payment methods" id="My subscription / Payment methods header" />}
          subheader={
            <FormattedMessage
              defaultMessage="Manage your payment methods in application"
              id="My subscription / Payment methods subheader"
            />
          }
        />

        <div>
          <div className="space-y-3">
            {defaultMethod && renderCardDetails()}
            {paymentMethods.length === 0 && renderEmptyList()}
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
        </div>
      </div>
    </TabsContent>
  );
};

export default PaymentMethodContent;
