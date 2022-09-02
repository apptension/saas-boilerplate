import { StripePaymentMethod } from '../stripe/paymentMethod';
import { ApiFormSubmitResponse } from '../types';

export enum SubscriptionPlanName {
  FREE = 'free_plan',
  MONTHLY = 'monthly_plan',
  YEARLY = 'yearly_plan',
}

export interface SubscriptionPlan {
  id: string;
  pk: string;
  product: {
    id: string;
    name: string;
  };
  unitAmount: number;
}

export interface SubscriptionPhase {
  startDate: string;
  endDate: string;
  trialEnd: string | null;
  item: {
    price: SubscriptionPlan;
    quantity: number;
  };
}

export interface Subscription {
  subscription: {
    id: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialStart: string | null;
    trialEnd: string | null;
  } | null;
  phases: SubscriptionPhase[];
  canActivateTrial: boolean;
  defaultPaymentMethod: StripePaymentMethod | null;
}

export type SubscriptionGetApiResponseData = Subscription;

export type SubscriptionUpdateApiRequestData = { price: string };
export type SubscriptionUpdateApiResponseData = ApiFormSubmitResponse<SubscriptionUpdateApiRequestData, Subscription>;
