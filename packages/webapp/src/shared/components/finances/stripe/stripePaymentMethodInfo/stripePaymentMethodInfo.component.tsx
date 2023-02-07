import { FormattedMessage } from 'react-intl';

import { StripePaymentMethodCardBrand } from '../../../../services/api/stripe/paymentMethod';

import { FragmentType, useFragment } from '../../../../../shared/services/graphqlApi/__generated/gql';
import { STRIPE_ALL_PAYMENTS_METHODS_FRAGMENT } from './stripePaymentMethodInfo.graphql';

export type StripePaymentMethodInfoProps = {
  method: FragmentType<typeof STRIPE_ALL_PAYMENTS_METHODS_FRAGMENT>;
};

const brandDisplayNames: Record<StripePaymentMethodCardBrand, string> = {
  [StripePaymentMethodCardBrand.Visa]: 'Visa',
};

export const StripePaymentMethodInfo = ({ method }: StripePaymentMethodInfoProps) => {
  const paymentMethod = useFragment(STRIPE_ALL_PAYMENTS_METHODS_FRAGMENT, method);

  return paymentMethod ? (
    <>
      {paymentMethod.billingDetails.name} {brandDisplayNames[paymentMethod.card.brand as StripePaymentMethodCardBrand]}{' '}
      **** {paymentMethod.card.last4}
    </>
  ) : (
    <FormattedMessage defaultMessage="None" id="Stripe Payment Method / None" />
  );
};
