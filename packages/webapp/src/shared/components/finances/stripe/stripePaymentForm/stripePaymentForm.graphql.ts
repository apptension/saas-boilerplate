import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';

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
