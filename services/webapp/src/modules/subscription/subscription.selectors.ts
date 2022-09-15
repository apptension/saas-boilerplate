import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../app/config/reducers';
import { SubscriptionPlanName } from '../../shared/services/api/subscription/types';

export const selectSubscriptionDomain = (state: GlobalState) => state.subscription;

export const selectActiveSubscription = createSelector(selectSubscriptionDomain, (state) => state.activeSubscription);

export const selectActiveSubscriptionPhase = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.phases?.[0]
);

export const selectActiveSubscriptionNextPhase = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.phases?.[1]
);

export const selectIsSubscriptionCanceled = createSelector(
  selectActiveSubscriptionNextPhase,
  (nextPhase) => nextPhase?.item.price.product.name === SubscriptionPlanName.FREE
);

export const selectActiveSubscriptionCancelDate = createSelector(
  selectActiveSubscriptionNextPhase,
  selectIsSubscriptionCanceled,
  (nextPhase, isCancelled) => (isCancelled ? nextPhase?.startDate : undefined)
);

export const selectActiveSubscriptionPeriodEndDate = createSelector(
  selectActiveSubscriptionPhase,
  (phase) => phase?.endDate
);

export const selectActiveSubscriptionRenewalDate = createSelector(
  selectActiveSubscriptionPeriodEndDate,
  selectActiveSubscriptionCancelDate,
  selectIsSubscriptionCanceled,
  (periodEndDate, cancelDate, isCancelled) => {
    return isCancelled ? undefined : periodEndDate;
  }
);

export const selectActiveSubscriptionPlan = createSelector(selectActiveSubscriptionPhase, (phase) => phase?.item.price);

export const selectActiveSubscriptionPaymentMethod = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.defaultPaymentMethod
);
