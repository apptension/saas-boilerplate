import { GraphQLClient } from 'graphql-request';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { getSdk } from './__generated/types';

const url = `https://graphql.contentful.com/content/v1/spaces/${process.env.REACT_APP_CONTENTFUL_SPACE}/environments/${process.env.REACT_APP_CONTENTFUL_ENV}?access_token=${process.env.REACT_APP_CONTENTFUL_TOKEN}`;

const gqlClientCore = new GraphQLClient(url);
export const client = getSdk(gqlClientCore);

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: url,
});
