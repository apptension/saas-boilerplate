import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';

export const STRIPE_CREATE_SETUP_INTENT_MUTTION = gql(/* GraphQL */ `
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
