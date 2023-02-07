import { useOutletContext } from 'react-router-dom';
import { PreloadedQuery } from 'react-relay';
import { subscriptionActivePlanDetailsQuery } from '../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import { StripeAllPaymentsMethodsQueryQuery } from '../../../shared/services/graphqlApi/__generated/gql/graphql';

export type ActiveSubscriptionDetailsContextType = {
  allPaymentMethods: StripeAllPaymentsMethodsQueryQuery['allPaymentMethods'];
  activeSubscriptionQueryRef?: PreloadedQuery<subscriptionActivePlanDetailsQuery> | null;
};

export const useActiveSubscriptionDetails = () => useOutletContext<ActiveSubscriptionDetailsContextType>();
