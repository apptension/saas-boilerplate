import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';

export const STRIPE_CREATE_PAYMENT_INTENT_MUTATION = gql(/* GraphQL */ `
  mutation stripeCreatePaymentIntentMutation_($input: CreatePaymentIntentMutationInput!) {
    createPaymentIntent(input: $input) {
      paymentIntent {
        ...stripePaymentIntentFragment
        id
      }
    }
  }
`);

export const STRIPE_UPDATE_PAYMENT_INTENT_MUTATION = gql(/* GraphQL */ `
  mutation stripeUpdatePaymentIntentMutation_($input: UpdatePaymentIntentMutationInput!) {
    updatePaymentIntent(input: $input) {
      paymentIntent {
        ...stripePaymentIntentFragment
        id
      }
    }
  }
`);
