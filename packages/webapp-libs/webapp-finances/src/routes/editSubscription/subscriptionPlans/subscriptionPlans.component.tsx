import { useQuery } from '@apollo/client';
import { mapConnection } from '@sb/webapp-core/utils/graphql';

import { useActiveSubscriptionDetails } from '../../../components/activeSubscriptionContext';
import { subscriptionPlansAllQuery } from './subscriptionPlans.graphql';
import { PlanItem, Plans } from './subscriptionPlans.styles';

export type SubscriptionPlansProps = {
  onPlanSelection: (id: string | null | undefined) => void;
  loading: boolean;
};

export const SubscriptionPlans = ({ onPlanSelection, loading }: SubscriptionPlansProps) => {
  const { activeSubscription } = useActiveSubscriptionDetails();

  const { data } = useQuery(subscriptionPlansAllQuery);

  return (
    <Plans>
      {mapConnection(
        (plan) => (
          <PlanItem
            key={plan.id}
            plan={plan}
            onSelect={onPlanSelection}
            activeSubscription={activeSubscription}
            loading={loading}
          />
        ),
        data?.allSubscriptionPlans
      )}
    </Plans>
  );
};
