import React from 'react';
import { FormattedMessage } from 'react-intl';
import { StripePaymentMethod, StripePaymentMethodCardBrand } from '../../../../services/api/stripe/paymentMethod';

export type StripePaymentMethodInfoProps = {
  method?: StripePaymentMethod | null;
};

const brandDisplayNames: Record<StripePaymentMethodCardBrand, string> = {
  [StripePaymentMethodCardBrand.Visa]: 'Visa',
};

export const StripePaymentMethodInfo = ({ method }: StripePaymentMethodInfoProps) => {
  return method ? (
    <>
      {method.billingDetails.name} {brandDisplayNames[method.card.brand]} **** {method.card.last4}
    </>
  ) : (
    <FormattedMessage defaultMessage="None" description="Stripe Payment Method / None" />
  );
};
