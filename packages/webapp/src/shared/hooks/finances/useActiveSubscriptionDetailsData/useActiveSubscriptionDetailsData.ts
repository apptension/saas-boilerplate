import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import SubscriptionActivePlanDetailsQuery, {
  subscriptionActivePlanDetailsQuery,
} from '../../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import subscriptionActiveSubscriptionFragmentGraphql, {
  subscriptionActiveSubscriptionFragment$key,
} from '../../../../modules/subscription/__generated__/subscriptionActiveSubscriptionFragment.graphql';
import subscriptionPlanItemFragmentGraphql, {
  subscriptionPlanItemFragment$key,
} from '../../../../modules/subscription/__generated__/subscriptionPlanItemFragment.graphql';
import { SubscriptionPlanName } from '../../../services/api/subscription/types';
import { useSubscriptionPlanDetails } from '../useSubscriptionPlanDetails';
import stripePaymentMethodFragmentGraphql, {
  stripePaymentMethodFragment$key,
} from '../../../../modules/stripe/__generated__/stripePaymentMethodFragment.graphql';

export const useActiveSubscriptionDetailsData = (
  activeSubscriptionQueryRef: PreloadedQuery<subscriptionActivePlanDetailsQuery>
) => {
  const data = usePreloadedQuery(SubscriptionActivePlanDetailsQuery, activeSubscriptionQueryRef);
  const activeSubscription = useFragment<subscriptionActiveSubscriptionFragment$key>(
    subscriptionActiveSubscriptionFragmentGraphql,
    data.activeSubscription
  );
  const phases = activeSubscription?.phases || [];
  const currentPhasePlan = phases[0]?.item?.price ?? null;
  const currentPhasePlanData = useFragment<subscriptionPlanItemFragment$key>(
    subscriptionPlanItemFragmentGraphql,
    currentPhasePlan
  );
  const activeSubscriptionPlan = useSubscriptionPlanDetails(currentPhasePlanData || undefined);
  const activeSubscriptionPeriodEndDate = phases[0]?.endDate;
  const nextPhasePlan = phases[1]?.item?.price ?? null;
  const nextPhasePlanData = useFragment<subscriptionPlanItemFragment$key>(
    subscriptionPlanItemFragmentGraphql,
    phases.length > 1 ? nextPhasePlan : currentPhasePlan
  );
  const activeSubscriptionIsCancelled = phases[1] && nextPhasePlanData?.product.name === SubscriptionPlanName.FREE;
  const activeSubscriptionExpiryDate = activeSubscriptionIsCancelled ? phases[1]?.startDate?.toString() : undefined;
  const activeSubscriptionRenewalDate = activeSubscriptionIsCancelled ? undefined : activeSubscriptionPeriodEndDate;
  const nextSubscriptionPlan = nextPhasePlanData ?? currentPhasePlanData;
  const nextSubscriptionPlanDetails = useSubscriptionPlanDetails(nextSubscriptionPlan || undefined);
  const trialEnd = activeSubscription?.subscription?.trialEnd?.toString();
  const isTrialActive = Boolean(trialEnd && Date.parse(trialEnd.toString()) >= Date.now());
  const isTrialEligible = Boolean(activeSubscription?.canActivateTrial);

  const defaultPaymentMethod = useFragment<stripePaymentMethodFragment$key>(
    stripePaymentMethodFragmentGraphql,
    (activeSubscription && activeSubscription.defaultPaymentMethod) || null
  );

  return {
    activeSubscriptionPlan,
    activeSubscriptionIsCancelled,
    activeSubscriptionExpiryDate,
    activeSubscriptionRenewalDate,
    nextSubscriptionPlanDetails,
    trialEnd,
    isTrialActive,
    isTrialEligible,
    defaultPaymentMethod,
  };
};
