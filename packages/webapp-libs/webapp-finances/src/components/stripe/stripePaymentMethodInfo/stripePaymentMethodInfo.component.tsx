import { StripePaymentMethodCardBrand } from '@sb/webapp-api-client/api/stripe/paymentMethod';
import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { FormattedMessage } from 'react-intl';

import { STRIPE_ALL_PAYMENTS_METHODS_FRAGMENT } from './stripePaymentMethodInfo.graphql';

export type StripePaymentMethodInfoProps = {
  method?: FragmentType<typeof STRIPE_ALL_PAYMENTS_METHODS_FRAGMENT> | null;
};

const brandDisplayNames: Record<StripePaymentMethodCardBrand, string> = {
  [StripePaymentMethodCardBrand.Visa]: 'Visa',
};

export const StripePaymentMethodInfo = ({ method }: StripePaymentMethodInfoProps) => {
  const paymentMethod = getFragmentData(STRIPE_ALL_PAYMENTS_METHODS_FRAGMENT, method);

  return paymentMethod ? (
    <>
      {paymentMethod.billingDetails.name} {brandDisplayNames[paymentMethod.card.brand as StripePaymentMethodCardBrand]}{' '}
      **** {paymentMethod.card.last4}
    </>
  ) : (
    <FormattedMessage defaultMessage="None" id="Stripe Payment Method / None" />
  );
};
