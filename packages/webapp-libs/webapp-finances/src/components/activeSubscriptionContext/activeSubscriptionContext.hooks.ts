import { StripeSubscriptionQueryQuery } from '@sb/webapp-api-client/graphql';
import { useOutletContext } from 'react-router-dom';

export type ActiveSubscriptionDetailsContextType = {
  allPaymentMethods: StripeSubscriptionQueryQuery['allPaymentMethods'];
  activeSubscription: StripeSubscriptionQueryQuery['activeSubscription'];
};

export const useActiveSubscriptionDetails = () => useOutletContext<ActiveSubscriptionDetailsContextType>();
