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
  fragment subscriptionStripePaymentMethod on StripePaymentMethodType {
    id
    billingDetails
    type
    card
  }
`;

graphql`
  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {
    phases {
      startDate
      endDate
      trialEnd
      item {
        price {
          ...subscriptionPlanItemFragment
        }
        quantity
      }
    }
    subscription {
      startDate
      trialEnd
      trialStart
    }
    canActivateTrial
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

graphql`
  query subscriptionActivePlanDetailsQuery {
    activeSubscription {
      ...subscriptionActiveSubscriptionFragment
    }
  }
`;
