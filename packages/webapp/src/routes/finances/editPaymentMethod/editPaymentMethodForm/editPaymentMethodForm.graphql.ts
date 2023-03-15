import { gql } from '@sb/webapp-api-client/graphql';

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
