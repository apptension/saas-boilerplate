export enum StripePaymentMethodCardBrand {
  Visa = 'visa',
}

export interface StripePaymentMethodCard {
  id: string;
  brand: StripePaymentMethodCardBrand;
  checks: {
    addressLine1Check: 'pass' | null;
    addressPostalCodeCheck: 'pass' | null;
    cvcCheck: 'pass' | null;
  };
  country: string;
  expMonth: number;
  expYear: number;
  fingerprint: string;
  funding: 'credit';
  generatedFrom: string;
  last4: string;
  threeDSecureUsage: {
    supported: true;
  };
}

export enum StripePaymentMethodType {
  Card = 'CARD',
}

export interface StripeBillingDetails {
  name: string;
}

export interface StripePaymentMethod {
  id: string;
  card: StripePaymentMethodCard;
  type: StripePaymentMethodType;
  billingDetails: StripeBillingDetails;
}
