import { SubscriptionPlan, SubscriptionPlanName } from '../../../services/api/subscription/types';
import { StripeAllPaymentsMethodsQueryQuery } from '../../../services/graphqlApi/__generated/gql/graphql';
import { useFragment } from '../../../services/graphqlApi/__generated/gql';
import { useSubscriptionPlanDetails } from '../useSubscriptionPlanDetails';
import { SUBSCRIPTION_ACTIVE_FRAGMENT } from './useActiveSubscriptionDetailsData.graphql';

export const useActiveSubscriptionDetailsData = (
  activeSubscriptionQuery: StripeAllPaymentsMethodsQueryQuery['activeSubscription']
) => {
  const activeSubscription = useFragment(SUBSCRIPTION_ACTIVE_FRAGMENT, activeSubscriptionQuery);

  const phases = activeSubscription?.phases || [];
  const currentPhasePlan = (phases[0]?.item?.price as SubscriptionPlan) ?? null;

  const activeSubscriptionPlan = useSubscriptionPlanDetails(currentPhasePlan || undefined);
  const activeSubscriptionPeriodEndDate = phases[0]?.endDate;
  const nextPhasePlan = (phases[1]?.item?.price as SubscriptionPlan) ?? currentPhasePlan;

  const activeSubscriptionIsCancelled = phases[1] && nextPhasePlan?.product.name === SubscriptionPlanName.FREE;
  const activeSubscriptionExpiryDate = activeSubscriptionIsCancelled ? phases[1]?.startDate?.toString() : undefined;
  const activeSubscriptionRenewalDate = activeSubscriptionIsCancelled ? undefined : activeSubscriptionPeriodEndDate;
  const nextSubscriptionPlan = nextPhasePlan ?? currentPhasePlan;
  const nextSubscriptionPlanDetails = useSubscriptionPlanDetails(nextSubscriptionPlan || undefined);
  const trialEnd = activeSubscription?.subscription?.trialEnd?.toString();
  const isTrialActive = Boolean(trialEnd && Date.parse(trialEnd.toString()) >= Date.now());
  const isTrialEligible = Boolean(activeSubscription?.canActivateTrial);

  const defaultPaymentMethod = activeSubscription?.defaultPaymentMethod;

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
