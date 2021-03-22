import { StripePaymentMethod } from '../stripe/paymentMethod';
import { ApiFormSubmitResponse } from '../types';

export enum SubscriptionPlanName {
  FREE = 'free_plan',
  MONTHLY = 'monthly_plan',
  YEARLY = 'yearly_plan',
}

export interface SubscriptionPlan {
  id: string;
  product: {
    id: string;
    name: SubscriptionPlanName;
  };
  unitAmount: number;
}

export interface Subscription {
  id: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart: string | null;
  trialEnd: string | null;
  canActivateTrial: boolean;
  defaultPaymentMethod: StripePaymentMethod | null;
  cancelAt?: string;
  item: {
    id: string;
    price: SubscriptionPlan;
    quantity: number;
  };
}

export type SubscriptionGetApiResponseData = Subscription;

export type SubscriptionPlansListApiResponseData = SubscriptionPlan[];

export type SubscriptionUpdateApiRequestData = { price: string };
export type SubscriptionUpdateApiResponseData = ApiFormSubmitResponse<SubscriptionUpdateApiRequestData, Subscription>;
