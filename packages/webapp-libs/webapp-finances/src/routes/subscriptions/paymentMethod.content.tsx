import { useQuery } from '@apollo/client';
import { StripeSubscriptionQueryQuery, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Link } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/cards';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { FormattedMessage } from 'react-intl';

import { StripePaymentMethodInfo } from '../../components/stripe/stripePaymentMethodInfo';
import { RoutesConfig } from '../../config/routes';
import { subscriptionActivePlanDetailsQuery, subscriptionActiveSubscriptionFragment } from '../../hooks';

export type PaymentMethodContentProps = {
  allPaymentMethods?: StripeSubscriptionQueryQuery['allPaymentMethods'];
};

export const PaymentMethodContent = ({ allPaymentMethods }: PaymentMethodContentProps) => {
  const generateLocalePath = useGenerateLocalePath();

  const { data } = useQuery(subscriptionActivePlanDetailsQuery);
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
    <div className="space-y-3">
      {defaultMethod && renderCardDetails()}
      {paymentMethods.length === 0 && renderEmptyList()}
      <Link to={generateLocalePath(RoutesConfig.subscriptions.paymentMethod)} variant="default">
        {paymentMethods.length ? (
          <FormattedMessage defaultMessage="Edit payment methods" id="My subscription / Edit payment method button" />
        ) : (
          <FormattedMessage defaultMessage="Add payment methods" id="My subscription / Add payment method button" />
        )}
      </Link>
    </div>
  );
};
