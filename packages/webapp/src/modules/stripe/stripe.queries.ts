import { graphql } from 'react-relay';

graphql`
  fragment stripePaymentMethodFragment on StripePaymentMethodType {
    id
    pk
    type
    card
    billingDetails
  }
`;

// todo: check better way of getting data outside of react render. Possibly @inline should work (currently broken)
graphql`
  query stripeAllPaymentMethodsQuery {
    allPaymentMethods(first: 100) @connection(key: "stripe_allPaymentMethods") {
      edges {
        node {
          # commented only because of the broken apollo types: need to fix it after migration
          #          ...stripePaymentMethodFragment @relay(mask: false)
          ...stripePaymentMethodFragment
        }
      }
    }
  }
`;

graphql`
  fragment stripeChargeFragment on StripeChargeType {
    id
    created
    billingDetails
    paymentMethod {
      ...stripePaymentMethodFragment
    }
    amount
    invoice {
      id
      subscription {
        plan {
          ...subscriptionPlanItemFragment
        }
      }
    }
  }
`;

graphql`
  query stripeAllChargesQuery {
    allCharges {
      edges {
        node {
          id
          ...stripeChargeFragment
        }
      }
    }
  }
`;

graphql`
  fragment stripePaymentIntentFragment on StripePaymentIntentType {
    id
    amount
    clientSecret
    currency
    pk
  }
`;

graphql`
  query stripePaymentIntentQuery($id: ID!) {
    paymentIntent(id: $id) {
      ...stripePaymentIntentFragment
    }
  }
`;
