import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';

export const stripeCreateSetupIntentMutation = gql(/* GraphQL */ `
  mutation stripeCreateSetupIntentMutation_($input: CreateSetupIntentMutationInput!) {
    createSetupIntent(input: $input) {
      setupIntent {
        id
        ...stripeSetupIntentFragment
      }
    }
  }

  fragment stripeSetupIntentFragment on StripeSetupIntentType {
    id
    clientSecret
  }
`);
