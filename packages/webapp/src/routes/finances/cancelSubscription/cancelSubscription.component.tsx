import { Suspense } from 'react';
import { useActiveSubscriptionDetails } from '../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { CancelSubscriptionContent } from './cancelSubscription.content';

export const CancelSubscription = () => {
  const { activeSubscriptionQueryRef } = useActiveSubscriptionDetails();

  if (!activeSubscriptionQueryRef) return null;

  return (
    <Suspense fallback={null}>
      <CancelSubscriptionContent activeSubscriptionQueryRef={activeSubscriptionQueryRef} />
    </Suspense>
  );
};
