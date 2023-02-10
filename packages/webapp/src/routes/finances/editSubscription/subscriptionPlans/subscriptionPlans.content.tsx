import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { StripeSubscriptionQueryQuery } from '../../../../shared/services/graphqlApi/__generated/gql/graphql';
import { mapConnection } from '../../../../shared/utils/graphql';
import { PlanItem, Plans } from './subscriptionPlans.styles';

export type SubscriptionPlansContentProps = {
  queryRef: PreloadedQuery<subscriptionPlansAllQuery>;
  onPlanSelection: (id: string | null) => void;
  activeSubscription: StripeSubscriptionQueryQuery['activeSubscription'];
  loading: boolean;
};

export const SubscriptionPlansContent = ({
  queryRef,
  onPlanSelection,
  activeSubscription,
  loading,
}: SubscriptionPlansContentProps) => {
  const { allSubscriptionPlans } = usePreloadedQuery(subscriptionPlansAllQueryGraphql, queryRef);

  return (
    <Plans>
      {mapConnection((plan) => {
        return (
          <PlanItem
            key={plan.id}
            plan={plan}
            onSelect={onPlanSelection}
            activeSubscription={activeSubscription}
            loading={loading}
          />
        );
      }, allSubscriptionPlans)}
    </Plans>
  );
};
