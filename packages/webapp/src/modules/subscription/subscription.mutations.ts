import graphql from 'babel-plugin-relay/macro';

graphql`
  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {
    changeActiveSubscription(input: $input) {
      subscriptionSchedule {
        ...subscriptionActiveSubscriptionFragment
      }
    }
  }
`;
