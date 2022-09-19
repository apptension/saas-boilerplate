import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import subscriptionActivePlanDetailsQueryGraphql, {
  subscriptionActivePlanDetailsQuery,
} from '../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import { StripePaymentMethodInfo } from '../../../shared/components/finances/stripe/stripePaymentMethodInfo';
import { RoutesConfig } from '../../../app/config/routes';
import subscriptionActiveSubscriptionFragmentGraphql, {
  subscriptionActiveSubscriptionFragment$key,
} from '../../../modules/subscription/__generated__/subscriptionActiveSubscriptionFragment.graphql';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { Link, Row, RowValue } from './subscriptions.styles';

export type PaymentMethodContentProps = {
  activeSubscriptionQueryRef: PreloadedQuery<subscriptionActivePlanDetailsQuery>;
};

export const PaymentMethodContent = ({ activeSubscriptionQueryRef }: PaymentMethodContentProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const data = usePreloadedQuery(subscriptionActivePlanDetailsQueryGraphql, activeSubscriptionQueryRef);
  const activeSubscription = useFragment<subscriptionActiveSubscriptionFragment$key>(
    subscriptionActiveSubscriptionFragmentGraphql,
    data.activeSubscription
  );

  if (!activeSubscription) return null;

  return (
    <>
      <Row>
        <FormattedMessage defaultMessage="Current method:" id="My subscription / Current method" />
        <RowValue>
          <StripePaymentMethodInfo method={activeSubscription.defaultPaymentMethod} />
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
