import { useOutletContext } from 'react-router-dom';
import { PreloadedQuery } from 'react-relay';
import { subscriptionActivePlanDetailsQuery } from '../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';

export type ActiveSubscriptionDetailsQueryRefContextType = {
  ref: PreloadedQuery<subscriptionActivePlanDetailsQuery>;
};

export const useActiveSubscriptionDetailsQueryRef = () =>
  useOutletContext<ActiveSubscriptionDetailsQueryRefContextType>();
