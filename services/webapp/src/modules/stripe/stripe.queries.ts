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
          ...stripePaymentMethodFragment @relay(mask: false)
          ...stripePaymentMethodFragment
        }
      }
    }
  }
`;
