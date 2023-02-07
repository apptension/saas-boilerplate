import { FormattedMessage } from 'react-intl';
import { useQuery } from '@apollo/client';

import { StripePaymentMethodInfo } from '../../../shared/components/finances/stripe/stripePaymentMethodInfo';
import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';

import { mapConnection } from '../../../shared/utils/graphql';
import { StripeAllPaymentsMethodsQueryQuery } from '../../../shared/services/graphqlApi/__generated/gql/graphql';
import { useFragment } from '../../../shared/services/graphqlApi/__generated/gql';

import {
  SUBSCRIPTION_ACTIVE_FRAGMENT,
  SUBSCRIPTION_ACTIVE_PLAN_DETAILS_QUERY,
} from '../../../shared/hooks/finances/useSubscriptionPlanDetails/useSubscriptionPlanDetails.graphql';

import { Link, Row, RowValue } from './subscriptions.styles';

export type PaymentMethodContentProps = {
  allPaymentMethods?: StripeAllPaymentsMethodsQueryQuery['allPaymentMethods'];
};

export const PaymentMethodContent = ({ allPaymentMethods }: PaymentMethodContentProps) => {
  const generateLocalePath = useGenerateLocalePath();

  const { data } = useQuery(SUBSCRIPTION_ACTIVE_PLAN_DETAILS_QUERY);
  const activeSubscription = useFragment(SUBSCRIPTION_ACTIVE_FRAGMENT, data?.activeSubscription);

  if (!activeSubscription) return null;

  const paymentMethods = mapConnection((plan) => plan, allPaymentMethods);
  const firstPaymentMethod = paymentMethods?.[0];

  return (
    <>
      <Row>
        <FormattedMessage defaultMessage="Current method:" id="My subscription / Current method" />
        <RowValue>
          <StripePaymentMethodInfo method={firstPaymentMethod} />
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
