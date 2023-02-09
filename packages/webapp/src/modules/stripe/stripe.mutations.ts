import { graphql } from 'react-relay';

graphql`
  mutation stripeCreateSetupIntentMutation($input: CreateSetupIntentMutationInput!) {
    createSetupIntent(input: $input) {
      setupIntent {
        ...stripeSetupIntentFragment
      }
    }
  }
`;
