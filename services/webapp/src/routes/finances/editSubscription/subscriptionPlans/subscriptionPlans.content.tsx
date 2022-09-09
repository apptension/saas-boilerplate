import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { mapConnection } from '../../../../shared/utils/graphql';
import { subscriptionActivePlanDetailsQuery } from '../../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import { Plans, PlanItem } from './subscriptionPlans.styles';

export type SubscriptionPlansContentProps = {
  queryRef: PreloadedQuery<subscriptionPlansAllQuery>;
  onPlanSelection: (id: string | null) => void;
  activeSubscriptionQueryRef: PreloadedQuery<subscriptionActivePlanDetailsQuery>;
};

export const SubscriptionPlansContent = ({
  queryRef,
  onPlanSelection,
  activeSubscriptionQueryRef,
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
            activeSubscriptionQueryRef={activeSubscriptionQueryRef}
          />
        );
      }, allSubscriptionPlans)}
    </Plans>
  );
};
