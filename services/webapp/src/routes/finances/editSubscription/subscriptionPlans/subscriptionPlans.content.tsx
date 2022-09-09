import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { mapConnection } from '../../../../shared/utils/graphql';
import { Plans, PlanItem } from './subscriptionPlans.styles';

export type SubscriptionPlansContentProps = {
  queryRef: PreloadedQuery<subscriptionPlansAllQuery>;
  onPlanSelection: (id: string | null) => void;
};

export const SubscriptionPlansContent = ({ queryRef, onPlanSelection }: SubscriptionPlansContentProps) => {
  const { allSubscriptionPlans } = usePreloadedQuery(subscriptionPlansAllQueryGraphql, queryRef);

  return (
    <Plans>
      {mapConnection((plan) => {
        return <PlanItem key={plan.id} plan={plan} onSelect={onPlanSelection} />;
      }, allSubscriptionPlans)}
    </Plans>
  );
};
