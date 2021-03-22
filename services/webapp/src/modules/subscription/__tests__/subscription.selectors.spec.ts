import { selectIsTrialActive } from '../subscription.selectors';
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
});
