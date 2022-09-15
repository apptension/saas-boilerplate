import { useEffect, Suspense } from 'react';
import { useQueryLoader } from 'react-relay';
import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { useActiveSubscriptionDetailsQueryRef } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { SubscriptionPlansContent } from './subscriptionPlans.content';

export type SubscriptionPlansProps = {
  onPlanSelection: (id: string | null) => void;
};

export const SubscriptionPlans = ({ onPlanSelection }: SubscriptionPlansProps) => {
  const [plansQueryRef, loadPlansQuery] = useQueryLoader<subscriptionPlansAllQuery>(subscriptionPlansAllQueryGraphql);
  const activeSubscriptionDetailsQueryRefContext = useActiveSubscriptionDetailsQueryRef();

  useEffect(() => {
    loadPlansQuery({});
  }, [loadPlansQuery]);

  if (!plansQueryRef || !activeSubscriptionDetailsQueryRefContext || !activeSubscriptionDetailsQueryRefContext.ref)
    return null;

  return (
    <Suspense fallback={null}>
      <SubscriptionPlansContent
        queryRef={plansQueryRef}
        onPlanSelection={onPlanSelection}
        activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref}
      />
    </Suspense>
  );
};
