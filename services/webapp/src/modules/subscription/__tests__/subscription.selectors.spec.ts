import { selectIsTrialActive, selectActiveSubscriptionRenewalDate } from '../subscription.selectors';
import { prepareState } from '../../../mocks/store';
import { subscriptionFactory } from '../../../mocks/factories';

describe('Subscription: selectors', () => {
  describe('selectIsTrialActive', () => {
    it('should return true if trialEnd is set and is in the future', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory();
        state.subscription.activeSubscription.trialEnd = new Date('Jan 1, 2099 GMT').toISOString();
      });
      expect(selectIsTrialActive(store)).toBe(true);
    });

    it('should return false if trialEnd is set and is in the past', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory();
        state.subscription.activeSubscription.trialEnd = new Date('Jan 1, 2000 GMT').toISOString();
      });
      expect(selectIsTrialActive(store)).toBe(false);
    });

    it('should return false if trialEnd is not set', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory();
        state.subscription.activeSubscription.trialEnd = null;
      });
      expect(selectIsTrialActive(store)).toBe(false);
    });
  });

  describe('selectActiveSubscriptionRenewalDate', () => {
    describe('subscription is not canceled', () => {
      it('should return period end date', () => {
        const periodEndDateString = new Date('Jan 1, 2099 GMT').toISOString();
        const store = prepareState((state) => {
          state.subscription.activeSubscription = subscriptionFactory();
          state.subscription.activeSubscription.currentPeriodEnd = periodEndDateString;
          state.subscription.activeSubscription.cancelAt = undefined;
        });
        expect(selectActiveSubscriptionRenewalDate(store)).toEqual(periodEndDateString);
      });
    });

    describe('subscription is canceled with date equal to period end time', () => {
      it('should return undefined', () => {
        const periodEndDateString = new Date('Jan 1, 2099 GMT').toISOString();
        const store = prepareState((state) => {
          state.subscription.activeSubscription = subscriptionFactory();
          state.subscription.activeSubscription.currentPeriodEnd = periodEndDateString;
          state.subscription.activeSubscription.cancelAt = periodEndDateString;
        });
        expect(selectActiveSubscriptionRenewalDate(store)).toBeUndefined();
      });
    });

    describe('subscription is canceled with date before period end', () => {
      it('should return undefined', () => {
        const cancelDateString = new Date('Jan 1, 2099 GMT').toISOString();
        const periodEndDateString = new Date('Jan 10, 2099 GMT').toISOString();
        const store = prepareState((state) => {
          state.subscription.activeSubscription = subscriptionFactory();
          state.subscription.activeSubscription.currentPeriodEnd = periodEndDateString;
          state.subscription.activeSubscription.cancelAt = cancelDateString;
        });
        expect(selectActiveSubscriptionRenewalDate(store)).toBeUndefined();
      });
    });

    describe('subscription is canceled with date after period end', () => {
      it('should return period end date', () => {
        const cancelDateString = new Date('Jan 10, 2099 GMT').toISOString();
        const periodEndDateString = new Date('Jan 1, 2099 GMT').toISOString();
        const store = prepareState((state) => {
          state.subscription.activeSubscription = subscriptionFactory();
          state.subscription.activeSubscription.currentPeriodEnd = periodEndDateString;
          state.subscription.activeSubscription.cancelAt = cancelDateString;
        });
        expect(selectActiveSubscriptionRenewalDate(store)).toEqual(periodEndDateString);
      });
    });
  });
});
