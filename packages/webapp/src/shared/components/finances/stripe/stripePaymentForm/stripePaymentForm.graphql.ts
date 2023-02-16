import { gql } from '../../../../services/graphqlApi/__generated/gql';

gql(/* GraphQL */ `
  fragment stripePaymentIntentFragment on StripePaymentIntentType {
    id
    amount
    clientSecret
    currency
    pk
  }
`);

export const stripeCreatePaymentIntentMutation = gql(/* GraphQL */ `
  mutation stripeCreatePaymentIntentMutation_($input: CreatePaymentIntentMutationInput!) {
    createPaymentIntent(input: $input) {
      paymentIntent {
        ...stripePaymentIntentFragment
        id
      }
    }
  }
`);

export const stripeUpdatePaymentIntentMutation = gql(/* GraphQL */ `
  mutation stripeUpdatePaymentIntentMutation_($input: UpdatePaymentIntentMutationInput!) {
    updatePaymentIntent(input: $input) {
      paymentIntent {
        ...stripePaymentIntentFragment
        id
      }
    }
  }
`);
