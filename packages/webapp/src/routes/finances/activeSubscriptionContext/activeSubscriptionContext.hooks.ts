import { useOutletContext } from 'react-router-dom';

import { StripeSubscriptionQueryQuery } from '../../../shared/services/graphqlApi/__generated/gql/graphql';

export type ActiveSubscriptionDetailsContextType = {
  allPaymentMethods: StripeSubscriptionQueryQuery['allPaymentMethods'];
  activeSubscription: StripeSubscriptionQueryQuery['activeSubscription'];
};

export const useActiveSubscriptionDetails = () => useOutletContext<ActiveSubscriptionDetailsContextType>();
