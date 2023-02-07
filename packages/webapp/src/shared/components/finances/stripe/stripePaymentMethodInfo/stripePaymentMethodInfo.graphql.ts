import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';

export const STRIPE_ALL_PAYMENTS_METHODS_FRAGMENT = gql(/* GraphQL */ `
  fragment stripePaymentMethodFragment on StripePaymentMethodType {
    id
    pk
    type
    card
    billingDetails
  }
`);
