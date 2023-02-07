import { Suspense } from 'react';
import { useQuery } from '@apollo/client';
import { FormattedMessage } from 'react-intl';

import { PaymentFormFields } from './stripePaymentMethodSelector.types';
import {
  StripePaymentMethodSelectorContent,
  StripePaymentMethodSelectorContentProps,
} from './stripePaymentMethodSelector.content';
import { STRIPE_ALL_PAYMENTS_METHODS_QUERY } from './stripePaymentMethodSelector.graphql';

export type StripePaymentMethodSelectorProps<T extends PaymentFormFields> = Omit<
  StripePaymentMethodSelectorContentProps<T>,
  'allPaymentMethodsQueryRef'
>;

export const StripePaymentMethodSelector = <T extends PaymentFormFields>(
  props: StripePaymentMethodSelectorProps<T>
) => {
  const { data, loading } = useQuery(STRIPE_ALL_PAYMENTS_METHODS_QUERY, { nextFetchPolicy: 'cache-and-network' });

  if (loading)
    return (
      <span>
        <FormattedMessage defaultMessage="Loading..." id="Loading message" />
      </span>
    );

  return (
    <Suspense fallback={null}>
      <StripePaymentMethodSelectorContent {...props} allPaymentMethods={data?.allPaymentMethods} />
    </Suspense>
  );
};
