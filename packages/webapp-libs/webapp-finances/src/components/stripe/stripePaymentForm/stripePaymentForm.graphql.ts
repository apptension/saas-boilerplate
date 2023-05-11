import { gql } from '@sb/webapp-api-client/graphql';

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
        amount
        clientSecret
        currency
        pk
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
        amount
        clientSecret
        currency
        pk
      }
    }
  }
`);
