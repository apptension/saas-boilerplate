import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../config/reducers';

export const selectSubscriptionDomain = (state: GlobalState) => state.subscription;

export const selectAvailableSubscriptionPlans = createSelector(
  selectSubscriptionDomain,
  (state) => state.availablePlans
);

export const selectActiveSubscription = createSelector(selectSubscriptionDomain, (state) => state.activeSubscription);

export const selectActiveSubscriptionCancelDate = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.cancelAt
);

export const selectActiveSubscriptionPeriodEndDate = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.currentPeriodEnd
);

export const selectActiveSubscriptionRenewalDate = createSelector(
  selectActiveSubscriptionPeriodEndDate,
  selectActiveSubscriptionCancelDate,
  (periodEndDate, cancelDate) => {
    if (!cancelDate || !periodEndDate) {
      return periodEndDate;
    }
    return Date.parse(periodEndDate) >= Date.parse(cancelDate) ? undefined : periodEndDate;
  }
);

export const selectActiveSubscriptionPlan = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.item.price
);

export const selectActiveSubscriptionPaymentMethod = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.defaultPaymentMethod
);

export const selectTrialEnd = createSelector(selectActiveSubscription, (subscription) => subscription?.trialEnd);

export const selectIsTrialActive = createSelector(selectTrialEnd, (trialEnd) =>
  Boolean(trialEnd && Date.parse(trialEnd) >= Date.now())
);

export const selectIsTrialEligible = createSelector(selectActiveSubscription, (subscription) =>
  Boolean(subscription?.canActivateTrial)
);
