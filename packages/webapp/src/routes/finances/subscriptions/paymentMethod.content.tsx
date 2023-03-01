import { useQuery } from '@apollo/client';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../app/config/routes';
import { StripePaymentMethodInfo } from '../../../shared/components/finances/stripe/stripePaymentMethodInfo';
import { useGenerateLocalePath } from '../../../shared/hooks/';
import { useFragment } from '../../../shared/services/graphqlApi/__generated/gql';
import { StripeSubscriptionQueryQuery } from '../../../shared/services/graphqlApi/__generated/gql/graphql';
import { mapConnection } from '../../../shared/utils/graphql';
import {
  subscriptionActiveFragment,
  subscriptionActivePlanDetailsQuery,
} from '../hooks/useSubscriptionPlanDetails/useSubscriptionPlanDetails.graphql';
import { Link, Row, RowValue } from './subscriptions.styles';

export type PaymentMethodContentProps = {
  allPaymentMethods?: StripeSubscriptionQueryQuery['allPaymentMethods'];
};

export const PaymentMethodContent = ({ allPaymentMethods }: PaymentMethodContentProps) => {
  const generateLocalePath = useGenerateLocalePath();

  const { data } = useQuery(subscriptionActivePlanDetailsQuery);
  const activeSubscription = useFragment(subscriptionActiveFragment, data?.activeSubscription);

  if (!activeSubscription) return null;

  const paymentMethods = mapConnection((plan) => plan, allPaymentMethods);
  const defaultMethod =
    paymentMethods.find(({ id }) => id === activeSubscription.defaultPaymentMethod?.id) || paymentMethods[0];

  return (
    <>
      <Row>
        <FormattedMessage defaultMessage="Current method:" id="My subscription / Current method" />
        <RowValue>
          <StripePaymentMethodInfo method={defaultMethod} />
        </RowValue>
      </Row>
      <Link to={generateLocalePath(RoutesConfig.subscriptions.paymentMethod)}>
        {activeSubscription.defaultPaymentMethod ? (
          <FormattedMessage defaultMessage="Edit payment method" id="My subscription / Edit payment method button" />
        ) : (
          <FormattedMessage defaultMessage="Add payment method" id="My subscription / Add payment method button" />
        )}
      </Link>
    </>
  );
};
