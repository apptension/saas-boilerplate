import graphql from 'babel-plugin-relay/macro';

graphql`
  query subscriptionActivePlanDetailsQuery {
    activeSubscription {
      ...subscriptionActiveSubscriptionFragment
    }
  }
`;
