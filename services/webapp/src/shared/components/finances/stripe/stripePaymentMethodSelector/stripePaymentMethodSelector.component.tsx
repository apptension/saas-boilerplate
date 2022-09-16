import { useEffect, Suspense } from 'react';
import { useQueryLoader } from 'react-relay';
import stripeAllPaymentMethodsQueryGraphql, {
  stripeAllPaymentMethodsQuery,
} from '../../../../../modules/stripe/__generated__/stripeAllPaymentMethodsQuery.graphql';
import { PaymentFormFields } from './stripePaymentMethodSelector.types';
import {
  StripePaymentMethodSelectorContent,
  StripePaymentMethodSelectorContentProps,
} from './stripePaymentMethodSelector.content';

export type StripePaymentMethodSelectorProps<T extends PaymentFormFields = PaymentFormFields> = Omit<
  StripePaymentMethodSelectorContentProps<T>,
  'allPaymentMethodsQueryRef'
>;

export const StripePaymentMethodSelector = <T extends PaymentFormFields = PaymentFormFields>(
  props: StripePaymentMethodSelectorProps<T>
) => {
  const [allPaymentMethodsQueryRef, loadAllPaymentMethodsQuery] = useQueryLoader<stripeAllPaymentMethodsQuery>(
    stripeAllPaymentMethodsQueryGraphql
  );

  useEffect(() => {
    loadAllPaymentMethodsQuery({}, { fetchPolicy: 'store-and-network' });
  }, [loadAllPaymentMethodsQuery]);

  if (!allPaymentMethodsQueryRef) return null;

  return (
    <Suspense fallback={null}>
      <StripePaymentMethodSelectorContent {...props} allPaymentMethodsQueryRef={allPaymentMethodsQueryRef} />
    </Suspense>
  );
};
