import graphql from 'babel-plugin-relay/macro';

graphql`
  fragment subscriptionPlanItemFragment on SubscriptionPlanType {
    id
    pk
    product {
      id
      name
    }
    unitAmount
  }
`;

graphql`
  query subscriptionPlansAllQuery {
    allSubscriptionPlans(first: 100) {
      edges {
        node {
          id
          ...subscriptionPlanItemFragment
        }
      }
    }
  }
`;
