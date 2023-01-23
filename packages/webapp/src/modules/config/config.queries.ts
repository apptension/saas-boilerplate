import graphql from 'babel-plugin-relay/macro';

graphql`
  query configContentfulAppConfigQuery {
    appConfigCollection(limit: 1) {
      items {
        name
        privacyPolicy
        termsAndConditions
      }
    }
  }
`;
