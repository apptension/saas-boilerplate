import { FormattedMessage } from 'react-intl';
import { useFragment } from 'react-relay';
import { StripePaymentMethodCardBrand } from '../../../../services/api/stripe/paymentMethod';
import stripePaymentMethodFragmentGraphql, {
  stripePaymentMethodFragment$key,
} from '../../../../../modules/stripe/__generated__/stripePaymentMethodFragment.graphql';

export type StripePaymentMethodInfoProps = {
  method: stripePaymentMethodFragment$key | null;
};

const brandDisplayNames: Record<StripePaymentMethodCardBrand, string> = {
  [StripePaymentMethodCardBrand.Visa]: 'Visa',
};

export const StripePaymentMethodInfo = ({ method }: StripePaymentMethodInfoProps) => {
  const paymentMethod = useFragment<stripePaymentMethodFragment$key>(stripePaymentMethodFragmentGraphql, method);

  return paymentMethod ? (
    <>
      {paymentMethod.billingDetails.name} {brandDisplayNames[paymentMethod.card.brand as StripePaymentMethodCardBrand]}{' '}
      **** {paymentMethod.card.last4}
    </>
  ) : (
    <FormattedMessage defaultMessage="None" id="Stripe Payment Method / None" />
  );
};
