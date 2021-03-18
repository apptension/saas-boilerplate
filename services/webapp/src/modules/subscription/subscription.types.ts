import { Subscription } from '../../shared/services/api/subscription/types';

export interface SubscriptionState {
  activeSubscription: Subscription | null;
}

export type FetchSubscriptionSuccessPayload = any;
