import { useQuery } from '@apollo/client';
import { StripeSubscriptionQueryQuery, getFragmentData } from '@sb/webapp-api-client/graphql';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { FormattedMessage } from 'react-intl';

import { StripePaymentMethodInfo } from '../../components/stripe/stripePaymentMethodInfo';
import { RoutesConfig } from '../../config/routes';
import { subscriptionActivePlanDetailsQuery, subscriptionActiveSubscriptionFragment } from '../../hooks';
import { Link, Row, RowValue } from './subscriptions.styles';

export type PaymentMethodContentProps = {
  allPaymentMethods?: StripeSubscriptionQueryQuery['allPaymentMethods'];
};

export const PaymentMethodContent = ({ allPaymentMethods }: PaymentMethodContentProps) => {
  const generateLocalePath = useGenerateLocalePath();

  const { data } = useQuery(subscriptionActivePlanDetailsQuery);
  const activeSubscription = getFragmentData(subscriptionActiveSubscriptionFragment, data?.activeSubscription);

  const paymentMethods = mapConnection((plan) => plan, allPaymentMethods);
  const defaultMethod = paymentMethods.find(({ id }) => id === activeSubscription?.defaultPaymentMethod?.id);

  return (
    <>
      <Row>
        <FormattedMessage defaultMessage="Current method:" id="My subscription / Current method" />
        <RowValue>
          <StripePaymentMethodInfo method={defaultMethod} />
        </RowValue>
      </Row>
      <Link to={generateLocalePath(RoutesConfig.subscriptions.paymentMethod)}>
        {activeSubscription?.defaultPaymentMethod ? (
          <FormattedMessage defaultMessage="Edit payment method" id="My subscription / Edit payment method button" />
        ) : (
          <FormattedMessage defaultMessage="Add payment method" id="My subscription / Add payment method button" />
        )}
      </Link>
    </>
  );
};
